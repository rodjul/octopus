import boto3
import botocore
from json import loads
from json import dumps
from ast import literal_eval
from octopus import get_creds
from octopus import my_logging
from octopus import list_linked_accounts
from octopus import json_serial
from octopus import set_iam_password_policy
from octopus import get_file_from_s3
from os import environ

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

    return account_status["CreateAccountStatus"]

# ============================================================================#
# CALLS FUNCTION ON ROOT ACCOUNT TO CREATE CROSSACCOUNTROLE ON LINKED ACCOUNT #
# ============================================================================#
def create_octopusmngt_role(payer_id,account_id,payer_role):
    lambda_client = get_creds("lambda",Id=payer_id,role="octopus_svc")
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
    return iam_client.create_account_alias(AccountAlias=alias)

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
        my_logging("Could not create IDP: {}".format(e))
        return e



# ============================================================================#
#                        EXECUTE CLOUDFORMATION STACKS                        #
# ============================================================================#
def create_stack_cloudformation(account_id, file_s3, payer_role):
    cloudformation_client = get_creds("cloudformation",Id=account_id, role=payer_role)
    try:
        result = cloudformation_client.create_stack(
            StackName = 'iam-createroles',
            TemplateURL = "https://{0}.s3.us-east-2.amazonaws.com/cloudformation/{1}_without_octopusmngt.json".formation(environ['octopus_resource'],file_s3),
            Parameters=[
                {
                    'ParameterKey': 'ArnIdentityProvider',
                    'ParameterValue': 'arn:aws:iam::{0}:saml-provider/ADFS'.format(account_id)
                }
            ]

        )
        my_logging("Cloudformation {}".format(result))
    except botocore.exceptions.ClientError as e:
        my_logging("Could not create Cloudformation: {}".format(e))
        return e


# ============================================================================#
#                                 MAIN FUNCTION                               #
# ============================================================================#
def main_function(event):

    # the role to do cross account when creating the account in the aws console
    payer_role = "security"

    # getting temp credentials
    orgs_client = get_creds(
        "organizations",
        Id=event["payer_id"],
        role="octopus_svc"
    )
    
    account = create_account(
        orgs_client,
        event["payer_id"],
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
        create_octopusmngt_role(
            event["payer_id"],
            status["AccountId"],
            payer_role
        )

        iam_client = get_creds("iam",Id=status["AccountId"])

        set_alias(iam_client,event["name"])

        set_iam_password_policy(iam_client)

        create_adfs(iam_client)

        # given a cloudformation file, this cloudformation will create the necessay roles for the account
        file_s3 = event['file_cloudformation']
        create_stack_cloudformation(account["CreateAccountStatus"]["Id"], file_s3, payer_role)

    else:
        my_logging("Error on Account Creation: {}".format(status))
        return status


# ============================================================================#
#                                INPUT FUNCTION                               #
# ============================================================================#
def lambda_handler(event,context):
    my_logging("Event Received on Lambda Trigger: {}".format(event))
    # Verifies if the event has more then 1 message in payload

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