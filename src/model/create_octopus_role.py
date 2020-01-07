import boto3
import botocore
from octopus import get_creds
from octopus import my_logging
from json import dumps

# ============================================================================#
#                      TRUST POLICY FOR OCTOPUSMNGT ROLE                      #
# ============================================================================#
def trust_policy_octopus():
    return """{
                "Version": "2012-10-17",
                "Statement": [
                    {
                    "Sid": "assumeoctopusmngt",
                    "Effect": "Allow",
                    "Principal": {
                        "AWS": "arn:aws:iam::826839167791:root"
                    },
                    "Action": "sts:AssumeRole"
                    }
                ]
            }"""


# ============================================================================#
#    CREATES ROLE ON LINKED ACCOUNT THROUGH PAYERS ACCOUNT MANAGEMENT ROLE    #
# ============================================================================#
def create_octopus_role(iam_client,trust_policy):
    return iam_client.create_role(
        RoleName=octopusmngt,
        AssumeRolePolicyDocument=trust_policy,
        Description="Role used by Octopus to manage accounts"
    )

# ============================================================================#
# ATTACHES POLICIES ON LINKED ACCOUNT THROUGH PAYERS ACCOUNT MANAGEMENT ROLE  #
# ============================================================================#
def attach_octopus_policies(iam_client):
    policies = [
        "arn:aws:iam::aws:policy/IAMFullAccess",
        "arn:aws:iam::aws:policy/AWSCloudTrailFullAccess",
        "arn:aws:iam::aws:policy/AWSCloudFormationFullAccess",
        "arn:aws:iam::aws:policy/ReadOnlyAccess"
    ]
    attachment = {}
    for policy in policies:
        try:
            attach = iam_client.attach_role_policy(
                RoleName=octopusmngt,
                PolicyArn=policy
            )
            attachment[policy] = attach
        except botocore.exceptions.ClientError as e:
                my_logging("Could not attach policy: {}".format(e),"error")
                return e

    return attachment

# ============================================================================#
#                DETACH POLICY FROM PAYER ROLE ON LINKED ACCOUNT              #
# ============================================================================#
def detach_payer_role_policy(iam_client,role_to_payer):
    return iam_client.detach_role_policy(
        RoleName=role_to_payer,
        PolicyArn=""
    )

# ============================================================================#
#                     DELETE PAYER ROLE ON LINKED ACCOUNT                     #
# ============================================================================#
def delete_payer_role(iam_client,role_to_payer):
    return iam_client.delete_role(
        RoleName=role_to_payer
    )


global octopusmngt
octopusmngt = "octopusmngt"

def lambda_handler(event,context):
    iam_client = get_creds(
        "iam",
        Id=event["account_id"],
        role=event["role_to_payer"])

    create_octopus_role(iam_client,trust_policy_octopus())

    attach_octopus_policies(iam_client)

    confirm_role = iam_client.get_role(RoleName=octopusmngt)
    if "Arn" in confirm_role["Role"]:
        detach_payer_role_policy(iam_client,event["role_to_payer"])

        delete_payer_role(iam_client,event["role_to_payer"])
    
    return {
        "statusCode":200,
        "body":dumps({"Octopusmngt":confirm_role["Role"]}),
        "headers":{
            "Content-Type":"application/json",
            "Access-Control-Allow-Origin":"*"
        }
    }