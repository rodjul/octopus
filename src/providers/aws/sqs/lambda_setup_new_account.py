import boto3
import botocore
from json import loads
from json import dumps
from ast import literal_eval
from model.octopus import get_creds, list_linked_accounts, json_serial, set_iam_password_policy, get_file_from_s3
# from model.dynamodb import insert_account_id_db, update_account_id_status
from model.iam_control import IamControl
from os import environ
from time import sleep
# import uuid
import json
import traceback


def notify_email_status_error(format_message):
    message = "This message was automatically sent to inform the status of creating a new account in AWS\n\n"+format_message

    lam = boto3.client("lambda")
    lam.invoke(
        FunctionName=environ["LAMBDA_SEND_EMAIL"],
        # FunctionName="octopussns-api-get_accounts_organizations-dev",
        InvocationType="RequestResponse",
        LogType="Tail",
        Payload=json.dumps(
            {
                "subject":"Octopus Account Creation Error (AWS)",
                "message":message
            }
        )
    )


def update_account_id_status(uuid, status):
    '''
    After create the index of the name account, update to insert the aws_account_id generated
    '''
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_account")
    table.update_item(
        Key={"UUID":uuid},
        UpdateExpression="set AccountStatus=:as",
        ExpressionAttributeValues={":as":status.upper()}
    )




def create_cloudtrail(account_id):
    '''
    CALLS FUNCTION TO CREATE CLOUDTRAIL
    '''
    lambda_client = get_creds("lambda")
    print("create_octopusmngt_role:",lambda_client)
    
    return lambda_client.invoke(
        FunctionName=environ['lambda_create_cloudtrail'],
        InvocationType="RequestResponse",
        LogType="Tail",
        Payload=dumps(
            {
                "Id":account_id
            }
        )
    )


def set_alias(iam_client,account_name):
    '''
    SETS ALIAS FOR NEW ACCOUNT
    '''
    alias = account_name.replace(".","-")
    try:
        iam_client.create_account_alias(AccountAlias=alias)
    except botocore.exceptions.ClientError as e:
        if e.response['Error']['Code'] == 'EntityAlreadyExists':
            print("Alias already exists. Error: {}".format(e))
        else:
            print("Error in alias: {}".format(e))


def create_adfs(iam_client):
    '''
    CREATE ADFS
    '''
    idp_name = "ADFS"
    saml_doc = get_file_from_s3(environ['octopus_resource'],"FederationMetadata.xml")

    try:
        create = iam_client.create_saml_provider(
            SAMLMetadataDocument=str(saml_doc),
            Name=idp_name
        )
        print("IDP created: {}".format(create))
        return create
    except botocore.exceptions.ClientError as e:
        if e.response['Error']['Code'] == 'EntityAlreadyExists':
            print("{} already exists. Error: {}".format(idp_name,e))
        else:
            print("Error in IDP: {}".format(e))
            raise e


def setup_roles_account(account_id, account_type):
    '''
    CREATE STANDARD ROLES AND POLICIES
    '''
    iamcontrol = IamControl(account_id)
    iamcontrol.setup_iam_account(account_type)


def main_function(event):
    
    uuid_account = event['uuid']
    new_account_id = event['new_account_id']

    iam_client = get_creds("iam",Id=new_account_id)

    set_alias(iam_client,event["name"])

    set_iam_password_policy(iam_client)
    
    try:
        create_adfs(iam_client)
    except Exception as e:
        print(e)
        print(traceback.format_exc(e))
        notify_email_status_error("AccountId: "+new_account_id+"\nOperation: Create ADFS\nError message:"+str(e))
    
    # given a cloudformation file, this cloudformation will create the necessay roles for the account
    account_type = event['account_type']
    try:
        setup_roles_account(new_account_id, account_type)
    except Exception as e:
        print(e)
        print(traceback.format_exc(e))
        notify_email_status_error("AccountId: "+new_account_id+"\nOperation: Setup IAM Roles\nError message:"+str(e))

    create_cloudtrail(new_account_id)

    update_account_id_status(uuid_account, "SUCCESSFULY_CREATED")



def lambda_handler(event,context):
   
    print("Event Received on Lambda Trigger: {}".format(event))
    # Verifies if the event has more then 1 message in payload
    #return {'statusCode':200,'body':'debug'}
    # This happens with multiple SQS messages in batch jobs
    if "Records" in event:
        print("{} messages for batch job".format(len(event["Records"])))
        for record in event["Records"]:
            print("Working on message: {}".format(record))
            main_function(literal_eval(record["body"]))

    # This happens when function is triggered directly by another lambda or api
    else:
        print("Single message in event. Trigger directly by api request")
        print("Working on message: {}".format(event))
        
        return {
            "statusCode":200,
            "body":dumps(main_function(event), default=json_serial),
            "headers":{
                "Content-Type":"application/json",
                "Access-Control-Allow-Origin":"*"
            }
        }