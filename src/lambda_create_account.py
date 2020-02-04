import boto3
import botocore
from json import loads
from json import dumps
from ast import literal_eval
from model.octopus import get_creds
from model.octopus import my_logging
from model.octopus import list_linked_accounts
from model.octopus import json_serial
from model.octopus import set_iam_password_policy
from model.octopus import get_file_from_s3
from model.dynamodb import save_account_db, insert_account_id_db
from model.iam_control import IamControl
from os import environ
from time import sleep

# ============================================================================#
#               CREATES NEW ACCOUNT UNDER ROOT (PAYER) ACCOUNT                #
# ============================================================================#
def create_account(orgs_client,payer_id,email,name,payer_role):
    try:
        new_account = orgs_client.create_account(
            Email=email,
            AccountName=name,
            RoleName=payer_role,
            IamUserAccessToBilling="ALLOW"
        )
        my_logging("New Account {} creation: {}".format(email,new_account))
        return new_account
    except botocore.exceptions.ClientError as e:
        my_logging("Could not create account: {}".format(e),"error")
        return e

# ============================================================================#
#                         VERIFIES NEW ACCOUNT STATUS                         #
# ============================================================================#
def new_account_status(orgs_client,create_id):
    account_status = orgs_client.describe_create_account_status(
        CreateAccountRequestId= create_id
    )
    my_logging(account_status)
    while account_status["CreateAccountStatus"]["State"] == "IN_PROGRESS":
        account_status = orgs_client.describe_create_account_status(
            CreateAccountRequestId= create_id
        )
        my_logging(account_status)
        sleep(6)

    return account_status["CreateAccountStatus"]

# ============================================================================#
# CALLS FUNCTION ON ROOT ACCOUNT TO CREATE CROSSACCOUNTROLE ON LINKED ACCOUNT #
# ============================================================================#
def create_octopusmngt_role(payer_id,account_id,payer_role):
    lambda_client = get_creds("lambda",Id=payer_id,role="octopus_svc")
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

# ============================================================================#
#                          SETS ALIAS FOR NEW ACCOUNT                         #
# ============================================================================#
def set_alias(iam_client,account_name):
    alias = account_name.replace(".","-")
    try:
        iam_client.create_account_alias(AccountAlias=alias)
    except botocore.exceptions.ClientError as e:
        if e.response['Error']['Code'] == 'EntityAlreadyExists':
            my_logging("Alias already exists. Error: {}".format(e))
        else:
            my_logging("Error in alias: {}".format(e))

# ============================================================================#
#                                 CREATE ADFS                                 #
# ============================================================================#
def create_adfs(iam_client):
    idp_name = "ADFS"
    saml_doc = get_file_from_s3(environ['octopus_resource'],"FederationMetadata.xml")

    try:
        create = iam_client.create_saml_provider(
            SAMLMetadataDocument=str(saml_doc),
            Name=idp_name
        )
        my_logging("IDP created: {}".format(create))
        return create
    except botocore.exceptions.ClientError as e:
        if e.response['Error']['Code'] == 'EntityAlreadyExists':
            my_logging("{} already exists. Error: {}".format(idp_name,e))
        else:
            my_logging("Error in IDP: {}".format(e))



# ============================================================================#
#                        CREATE STANDARD ROLES AND POLICIES                   #
# ============================================================================#
def setup_roles_account(account_id, account_type):
    iamcontrol = IamControl(account_id)
    iamcontrol.setup_iam_account(account_type)


# ============================================================================#
#                                 MAIN FUNCTION                               #
# ============================================================================#
def main_function(event):

    payer_id = environ['PAYER_ID']
    
    save_account_db(event['name'], event['email'])

    # the role to do cross account when creating the account in the aws console
    payer_role = "security"

    # getting temp credentials
    orgs_client = get_creds(
        "organizations",
        Id=payer_id,
        role="octopus_svc"
    )
    print("Orgs_client: ",orgs_client)
    
    account = create_account(
        orgs_client,
        payer_id,
        event["email"],
        event["name"],
        payer_role
    )
    my_logging(account)

    status = new_account_status(
        orgs_client,
        account["CreateAccountStatus"]["Id"]
    )
    
    if status["State"] == "SUCCEEDED":
        #storing the account id created
        insert_account_id_db(event['name'], status['AccountId'])

        response = create_octopusmngt_role(
            payer_id,
            status["AccountId"],
            payer_role
        )
        
        if response['ResponseMetadata']['HTTPStatusCode'] != 200:
            print(response)
            raise Exception
        
        # adding sleep because after create the role, the AWS didn't update the status that the role
        # was created and it can be used as sts
        print("Wainting 15 seconds to AWS updates the role")
        sleep(15)
        iam_client = get_creds("iam",Id=status["AccountId"])

        set_alias(iam_client,event["name"])

        set_iam_password_policy(iam_client)

        create_adfs(iam_client)
        
        # given a cloudformation file, this cloudformation will create the necessay roles for the account
        account_type = event['account_type'].lower()
        setup_roles_account(status["AccountId"], account_type)

    else:
        my_logging("Error on Account Creation: {}".format(status))
        return status


# ============================================================================#
#                                INPUT FUNCTION                               #
# ============================================================================#
def lambda_handler(event,context):
   
    my_logging("Event Received on Lambda Trigger: {}".format(event))
    # Verifies if the event has more then 1 message in payload
    #return {'statusCode':200,'body':'debug'}
    # This happens with multiple SQS messages in batch jobs
    if "Records" in event:
        my_logging("{} messages for batch job".format(len(event["Records"])))
        for record in event["Records"]:
            my_logging("Working on message: {}".format(record))
            main_function(literal_eval(record["body"]))

    # This happens when function is triggered directly by another lambda or api
    else:
        my_logging("Single message in event. Trigger directly by api request")
        my_logging("Working on message: {}".format(event))
        
        return {
            "statusCode":200,
            "body":dumps(main_function(event), default=json_serial),
            "headers":{
                "Content-Type":"application/json",
                "Access-Control-Allow-Origin":"*"
            }
        }