import boto3
from json import loads, dumps
# from boto3.dynamodb.conditions import Attr, Key
from urllib.parse import unquote
# from os import environ
# import re
from utils import logs
# from model.dynamodb import save_account_db
# import uuid
from model.useracl import UserACL


def get_info_account(uuid):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_account")
    resp = table.get_item(Key={"UUID": uuid})
    if "Item" in resp:
        return resp['Item']
    return ""



def lambda_handler(event,context):
    username = event.get('requestContext').get('authorizer').get('username')
    if not UserACL(username).has_acl("aws","list-account-info"):
        return {"statusCode":403, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

    try:
        account_uid = unquote( event["pathParameters"]['account_uid'] )
    except Exception:
        logs.write(event, "AWS", 400, {"pathParameters": event["pathParameters"]}, "List account info", "" )
        return {"statusCode":400, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    
    info = get_info_account(account_uid)

    logs.write(event, "AWS", 200, {"account_uid":account_uid}, "List account info", "" )

    return {"statusCode":200, "body":dumps({"error":False, "account_id": info.get('AccountId')}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
        