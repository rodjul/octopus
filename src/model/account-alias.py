import json
from octopus import get_creds

'''
Description: Adds or updates the Account Alias
Source: https://boto3.amazonaws.com/v1/documentation/api/latest/guide/iam-example-managing-account-aliases.html
Event: {"accounts":[ {"Id":"0123456789","Alias":"Bob" } ]
'''

def lambda_handler(event, context):
    
    for account in event['accounts']:
        account_id = account['Id']
        alias = account['Alias']
        
        iam_client = get_creds("iam",Id=account_id)

        try:
            #getting the currently account alias
            account_alias = iam_client.list_account_aliases()['AccountAliases'][0]
            print("Currently account alias: '{}'. Deleting to update".format(account_alias))
            
            #deleting
            response = iam_client.delete_account_alias(AccountAlias=account_alias)
            print("Deleting response: ",response['ResponseMetadata']['HTTPStatusCode'])
        except IndexError as e:
            pass
        finally:
            #creating account alias
            response = iam_client.create_account_alias(AccountAlias=alias)
            
            try:
                print("Added account alias in {}. ({})".format(account_id, response['ResponseMetadata']['HTTPStatusCode']))
            except Exception as e:
                print("Error in adding account alias. ERROR:",e)
            
            