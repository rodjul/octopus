import boto3
# from os import environ
# from datetime import date, datetime
from json import loads, dumps
import decimal
import operator
from utils import logs
from model.useracl import UserACL


def list_logs():
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_event_action_log")
    return table.scan()['Items']


def decimal_default(obj):
    '''
    https://stackoverflow.com/a/16957370
    '''
    if isinstance(obj, decimal.Decimal):
        return float(obj)
    raise TypeError

def lambda_handler(event, context):
    username = event.get('requestContext').get('authorizer').get('username')
    if not UserACL(username).has_acl("octopus","list-event-logs"):
        return {"statusCode":403, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

    event_logs = list_logs()

    event_logs.sort(key=operator.itemgetter("TimestampUTC"), reverse=True)

    logs.write(event, "OCTOPUS", 200, event['body'], "Get logs", "")

    return {"statusCode":200, "body":dumps({"error":False, "data": event_logs}, default=decimal_default),
    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
