import boto3
from json import loads, dumps
from boto3.dynamodb.conditions import Attr, Key
from urllib.parse import unquote
from os import environ
# import re
from utils import logs
# from model.dynamodb import save_account_db
from model.useracl import UserACL


def list_accounts():
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_account")
    resp = table.scan()
    return resp['Items']


def lambda_handler(event,context):
    username = event.get('requestContext').get('authorizer').get('username')
    if not UserACL(username).has_acl("aws","list-accounts-created"):
        return {"statusCode":403, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

    accounts = list_accounts()

    logs.write(event, "AWS", 200, "", "List accounts created", "" )

    return {"statusCode":200, "body":dumps({"error":False, "accounts": accounts}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
        