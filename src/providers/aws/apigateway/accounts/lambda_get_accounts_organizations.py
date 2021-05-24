import boto3
import json
from model.octopus import get_creds
from ast import literal_eval
from os import environ


def get_linked_accounts(orgs_client):
    linked_accounts = orgs_client.list_accounts()
    print("linked_accounts:",linked_accounts)
    print()
    
    accounts = linked_accounts['Accounts']
    
    while 'NextToken' in linked_accounts:
        token=linked_accounts['NextToken']
        linked_accounts = orgs_client.list_accounts(
            NextToken=token
        )
        
        accounts.extend(linked_accounts['Accounts'])
        print(linked_accounts)
        print()

    print('Done... removing timestamp info...')
    print()
    
    for account in accounts:
        account.pop('JoinedTimestamp',None)
    
    # filtrando somente as contas que contem status ACTIVE
    active_accounts = list()
    for account in accounts:
        if account['Status'] == "ACTIVE":
            #account.popitem()
            active_accounts.append(account)
    return active_accounts

def lambda_handler(event, context):
    print('message received on function trigger: %s' % event)
    orgs_client = get_creds("organizations",Id=environ['PAYER_ID_BRASILEIRA'])
    accounts = get_linked_accounts(orgs_client)
    
    orgs_client = get_creds("organizations",Id=environ['PAYER_ID_AMERICANA'])
    accounts.extend( get_linked_accounts(orgs_client) )
    
    print('Showing Accounts...')
    print()
    print(accounts)
    print ('A total of %s accounts are linked to your payer account...\
    ' % (len(accounts)))
    
    
    return {
        'statusCode':200,
        'body':json.dumps({"accounts":accounts }),
        "headers":{"Content-Type":"application/json",
                   "Access-Control-Allow-Origin":"*"}
        }