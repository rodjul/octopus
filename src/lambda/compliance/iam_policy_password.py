import json
import boto3
import botocore
import re


def get_creds(aws_service,**kwargs):
    if "Id" not in kwargs:
        return boto3.client(aws_service)
    else:
        try:
            sts = boto3.client("sts")
        except botocore.exceptions.ClientError as e:
            raise e

        if "role" in kwargs:
            role = kwargs["role"]
        else:
            role = "octopusmngt"

        if "session_name" in kwargs:
            session_name = kwargs["session_name"]
        else:
            session_name = "octopusroleassumed"
        
        try:
            role = sts.assume_role(
                RoleArn="arn:aws:iam::{}:role/{}".format(kwargs["Id"],role),
                RoleSessionName=session_name
            )
        except botocore.exceptions.ClientError as e:
            raise e

        if "region" in kwargs:
            region = kwargs["region"]
        else:
            region = "us-east-2"       

        try:    
            client = boto3.client(
                aws_service,
                region_name=region,
                aws_access_key_id=role['Credentials']['AccessKeyId'],
                aws_secret_access_key=role['Credentials']['SecretAccessKey'],
                aws_session_token=role['Credentials']['SessionToken']
            )
            return client
        except botocore.exceptions.ClientError as e:
            raise e



def set_iam_password_policy(iam_client):
    return iam_client.update_account_password_policy(
        MinimumPasswordLength=14,
        RequireSymbols=True,
        RequireNumbers=True,
        RequireUppercaseCharacters=True,
        RequireLowercaseCharacters=True,
        AllowUsersToChangePassword=True,
        MaxPasswordAge=60,
        PasswordReusePrevention=24,
        HardExpiry=False
    )
	
	
def lambda_handler(event, context):
    accounts_id = [
        ""
    ]

    for account in accounts_id:
        iam_client = get_creds("iam",Id=account)
        set_iam_password_policy(iam_client)