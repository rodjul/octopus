import boto3
from os import environ
from datetime import date, datetime
from json import loads, dumps
from utils import logs
from model.useracl import UserACL
import decimal


def list_users():
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_users")

    resp = table.scan()
    return resp['Items']


def decimal_default(obj):
    '''
    https://stackoverflow.com/a/16957370
    '''
    if isinstance(obj, decimal.Decimal):
        return float(obj)
    raise TypeError


def lambda_handler(event, context):
    username = event.get('requestContext').get('authorizer').get('username')
    if not UserACL(username).has_acl("octopus","list-users"):
        return {"statusCode":403, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    
    users = list_users()
    sort_asc = sorted(users, key = lambda i : i['Username'])
    # users.sort(key=operator.itemgetter("TimestampUTC"), reverse=True)

    format_data = {
        "users": sort_asc
    }
    
    return {"statusCode":200, "body":dumps({"error":False, "data":format_data}, default=decimal_default),
    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

    # return {"statusCode":403, "body":"",
    # "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
