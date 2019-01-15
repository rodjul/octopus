import boto3
from os import environ
import octopus

def lambda_handler(event, context):
    print('message received on function trigger: %s' % event)
    if octopus.validate_event_data(event):
        dynamodb_client = boto3.client('dynamodb')
        orgs_client = octopus.assume_role(
            event['payer_id'],
            'octopus_svc',
            'listlinkedaccounts',
            'organizations',
            'us-east-1')
        account = orgs_client.describe_account(
            AccountId= event['Id']
        )
        insert = dynamodb_client.put_item(
            TableName= environ['dynamoDbTable'],
            Item={
                'Id': {
                    'S': account['Account']['Id']
                },
                'Name': {
                    'S': account['Account']['Name']
                },
                'Email': {
                    'S': account['Account']['Email']
                },
                'Arn': {
                    'S': account['Account']['Arn']
                },
                'Status': {
                    'S': account['Account']['Status']
                },
                'JoinedMethod': {
                    'S': account['Account']['JoinedMethod']
                },
            },
            ReturnConsumedCapacity='TOTAL'
        )
        print(insert)
        return insert