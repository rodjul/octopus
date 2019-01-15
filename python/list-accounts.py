import boto3
from os import environ
from json import dumps
import octopus

def lambda_handler(event, context):
    print('message received on function trigger: %s' % event)
    if octopus.validate_event_data(event):
        orgs_client = boto3.client('organizations')
        dynamodb_client = boto3.client(
            'dynamodb',
            region_name='us-east-1')
        lambda_client = boto3.client('lambda')

        linked_accounts = orgs_client.list_accounts()
        accounts = linked_accounts['Accounts']
        print(linked_accounts)
        print()
        while linked_accounts['NextToken']:
            token=linked_accounts['NextToken']
            linked_accounts = orgs_client.list_accounts(
                NextToken=token
            )
            accounts.extend(linked_accounts['Accounts'])
            print(linked_accounts)
            print()
            if 'NextToken' not in linked_accounts:
                break

        print('Done... Showing accounts:')
        print(accounts)
        print ('A total of %s accounts are linked to your payer account...\
        ' % (len(accounts)))
        print()

        for account in accounts:
            item = dynamodb_client.get_item(
                TableName= environ['table_name'],
                Key={
                        'Id': {
                        'S': account['Id']
                        }
                },
                ReturnConsumedCapacity='TOTAL',
                ConsistentRead=True
            )
            print('account:')
            print(account)
            print('item:')
            print(item)
            print()

            if 'Item' in item and \
            'Arn' in item['Item'] and \
            'Email' in item['Item'] and \
            'Name' in item['Item'] and \
            'Status' in item['Item'] and \
            'JoinedMethod' in item['Item'] and \
            account['Arn'] == item['Item']['Arn']['S'] and \
            account['Email'] == item['Item']['Email']['S'] and \
            account['Name'] == item['Item']['Name']['S'] and \
            account['Status'] == item['Item']['Status']['S'] and \
            account['JoinedMethod'] == item['Item']['JoinedMethod']['S']:
                print('Account %s not changed.' % (account['Id']))
            elif 'Item' in item:
                print('Account %s changed.' % (account['Id']))
                msg = '''
    The AWS Account ID: %s 
    with e-mail: %s has been modified.
    Previous configuration was:
        - Name: %s;
        - Email: %s;
        - Arn: %s;
        - Status: %s;
        - Joined Method: %s

    Current configuration detected is:
        - Name: %s;
        - Email: %s;
        - Arn: %s;
        - Status: %s;
        - Joined Method: %s          
    ''' % (item['Item']['accountid']['S'],\
        item['Item']['Email']['S'],\
        item['Item']['Name']['S'],\
        item['Item']['Email']['S'],\
        item['Item']['Arn']['S'],\
        item['Item']['Status']['S'],\
        item['Item']['JoinedMethod']['S'],\
        account['Name'],\
        account['Email'],\
        account['Arn'],\
        account['Status'],\
        account['JoinedMethod'],\
        )
                print(msg)
                insert_account = lambda_client.invoke(
                    FunctionName=environ['insert-account-function'],
                    InvocationType='RequestResponse',
                    LogType='Tail',
                    Payload=dumps(account)
                )
                print(insert_account)
            elif 'Item' not in item:
                print('New Account %s detected on your AWS Organization\
                ' % (account['Id']))
                msg = '''
    The AWS Account ID: %s is new in your environment.
    Current configuration detected is:
        - Name: %s;
        - Email: %s;
        - Arn: %s;
        - Status: %s;
        - Joined Method: %s          
    ''' % (account['Id'],\
        account['Name'],\
        account['Email'],\
        account['Arn'],\
        account['Status'],\
        account['JoinedMethod'],\
        )
                print(msg)
                insert_account = lambda_client.invoke(
                    FunctionName=environ['insert-account-function'],
                    InvocationType='RequestResponse',
                    LogType='Tail',
                    Payload=dumps(account)
                )
                print(insert_account)