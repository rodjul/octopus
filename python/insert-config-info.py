import boto3
from os import environ
import octopus

def lambda_handler(event, context):
    print('message received on function trigger: %s' % event)
    if octopus.validate_event_data(event):
        dynamodb_client = boto3.client('dynamodb')

        insert = dynamodb_client.put_item(
            TableName= environ['dynamoDbTable'],
            Item={
                'Id': {
                    'S': event['Id']
                },
                'config_files': {
                    'L': event['config_files']
                },
            },
            ReturnConsumedCapacity='TOTAL'
        )

        return 'inserted Item: %s' % insert