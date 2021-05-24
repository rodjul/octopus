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
import uuid
import traceback


def insert_account_id_db(uuid, account_id_generated):
    '''
    After create the index of the name account, update to insert the aws_account_id generated
    '''
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_account")
    table.update_item(
        Key={"UUID":uuid},
        UpdateExpression="set AccountId=:ai",
        ExpressionAttributeValues={":ai":account_id_generated}
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




def create_account(orgs_client,payer_id,email,name,payer_role):
    '''
    CREATES NEW ACCOUNT UNDER ROOT (PAYER) ACCOUNT 
    '''
    try:
        new_account = orgs_client.create_account(
            Email=email,
            AccountName=name,
            RoleName=payer_role,
            IamUserAccessToBilling="ALLOW"
        )
        print("New Account {} creation: {}".format(email,new_account))
        return new_account
    except botocore.exceptions.ClientError as e:
        print("Could not create account: {}".format(e))
        return e


def new_account_status(orgs_client,create_id):
    '''
    VERIFIES NEW ACCOUNT STATUS
    '''
    account_status = orgs_client.describe_create_account_status(
        CreateAccountRequestId= create_id
    )
    print(account_status)
    while account_status["CreateAccountStatus"]["State"] == "IN_PROGRESS":
        account_status = orgs_client.describe_create_account_status(
            CreateAccountRequestId= create_id
        )
        print(account_status)
        sleep(6)

    return account_status["CreateAccountStatus"]


def create_octopusmngt_role(payer_id,account_id,payer_role):
    '''
    CALLS FUNCTION ON ROOT ACCOUNT TO CREATE CROSSACCOUNTROLE ON LINKED ACCOUNT
    '''
    lambda_client = get_creds("lambda", Id=payer_id, role="octopus_svc")
    print("create_octopusmngt_role:",lambda_client)
    
    return lambda_client.invoke(
        FunctionName="create_octopus_role",
        InvocationType="RequestResponse",
        LogType="Tail",
        Payload=dumps(
            {
                "account_id":account_id,
                "role_to_payer":payer_role
            }
        )
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


def setup_roles_account(account_id, account_type):
    '''
    CREATE STANDARD ROLES AND POLICIES
    '''
    iamcontrol = IamControl(account_id)
    iamcontrol.setup_iam_account(account_type)


def get_info_account(uuid):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_account")
    resp = table.get_item(Key={"UUID": uuid})
    if "Item" in resp:
        return resp['Item']
    return ""


def main_function(event):

    account_payer = event['account_payer'].upper()
    payer_id = environ['PAYER_ID' + "_"+ account_payer ]
    if not payer_id:
        raise Exception("Payer_id not found: "+account_payer)
    
    uuid_account = event['uuid']
    info_account = get_info_account(uuid_account)
    if info_account and info_account['AccountStatus'] != "NOT_CREATED":
        print("Already created")
        print("Event: ",event)
        return 200

    # the role to do cross account when creating the account in the aws console
    payer_role = "security"

    # getting temp credentials
    orgs_client = get_creds(
        "organizations",
        Id=payer_id,
        role="octopus_svc"
    )

    update_account_id_status(uuid_account, "CREATING ACCOUNT")
    
    account = create_account(
        orgs_client,
        payer_id,
        event["email"],
        event["name"],
        payer_role
    )

    status = new_account_status(
        orgs_client,
        account["CreateAccountStatus"]["Id"]
    )
    
    if status["State"] == "SUCCEEDED":
        #storing the account id created
        new_account_id = status['AccountId']

        insert_account_id_db(uuid_account, new_account_id)
        update_account_id_status(uuid_account, "CONFIGURING ACCOUNT")

        response = create_octopusmngt_role(
            payer_id,
            status["AccountId"],
            payer_role
        )
        
        if response['ResponseMetadata']['HTTPStatusCode'] != 200:
            print(response)
            update_account_id_status(uuid_account, "ERROR IN CREATING ROLE")
            raise Exception(dumps(response))
        
        # adding sleep because after create the role, the AWS didn't update the status that the role
        # was created and it can be used as sts
        # print("Wainting 15 seconds to AWS updates the role")
        # sleep(15)

        sqs_client = boto3.client("sqs")
        sqs_client.send_message(
            QueueUrl=environ['SQS_SETUP_NEW_ACCOUNT'],
            MessageBody=dumps({
                "uuid":uuid_account, 
                "name": event['name'], 
                "email":event['email'], 
                "account_type": event['account_type'],
                "new_account_id": new_account_id,
            })
        )

    else:
        print("Error on Account Creation: {}".format(status))
        update_account_id_status(uuid_account, "ERROR IN CREATING ACCOUNT")
        return status


def lambda_handler(event,context):
   
    print("Event Received on Lambda Trigger: {}".format(event))
    # Verifies if the event has more then 1 message in payload
    #return {'statusCode':200,'body':'debug'}
    # This happens with multiple SQS messages in batch jobs
    if "Records" in event:
        print("{} messages for batch job".format(len(event["Records"])))
        for record in event["Records"]:
            print("Working on message: {}".format(record))
            event = literal_eval(record["body"])
            try:
                main_function(event)
            except Exception as e:
                print(traceback.format_exc(e))
                update_account_id_status(event['uuid'], "ERROR")

    # This happens when function is triggered directly by another lambda or api
    # else:
    #     print("Single message in event. Trigger directly by api request")
    #     print("Working on message: {}".format(event))
        
    #     return {
    #         "statusCode":200,
    #         "body":dumps(main_function(event), default=json_serial),
    #         "headers":{
    #             "Content-Type":"application/json",
    #             "Access-Control-Allow-Origin":"*"
    #         }
    #     }