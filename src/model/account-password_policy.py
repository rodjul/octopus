import json
from octopus import get_creds
import boto3

'''
Description: Update password policy by given an ID Account
Source: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/iam.html#accountpasswordpolicy
Event: {"Id":"0123456789"}
'''

def lambda_handler(event, context):
    account_id = event['Id']
    
    iam_client = get_creds('iam',Id=account_id)
    response = iam_client.update_account_password_policy(
        MinimumPasswordLength=14,
        RequireSymbols=True,
        RequireNumbers=True,
        RequireUppercaseCharacters=True,
        RequireLowercaseCharacters=True,
        AllowUsersToChangePassword=True,
        MaxPasswordAge=60,
        PasswordReusePrevention=24
        )
    try:
        print("Password policy updated. ({})".format(response['ResponseMetadata']['HTTPStatusCode']))
    except Exception as e:
        print("Error in updating password policy. ERROR:",e)
    
    
    
