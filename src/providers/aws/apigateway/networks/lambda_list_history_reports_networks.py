import boto3
from os import environ
from datetime import date, datetime
from json import loads, dumps
from utils import logs
from model.useracl import UserACL


def list_history():
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_network_details_linked_accounts_history")
    return table.scan()['Items']



def lambda_handler(event, context):
    username = event.get('requestContext').get('authorizer').get('username')
    if not UserACL(username).has_acl("aws","get-network-report"):
        return {"statusCode":403, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
            
    history = list_history()

    if history:
        history = sorted(history, key = lambda i : i['Timestamp'])

    # logs.write(event, "AWS",  200, "", "All dates available of Network Report was requested" )
    logs.write(event, "AWS", 200, event['body'], "Get dates of Network Report", "")

    return {"statusCode":200, "body":dumps({"error":False, "data": history}),
    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
