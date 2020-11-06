import boto3
from os import environ
from datetime import date, datetime
from json import loads, dumps
from utils import logs
from model.useracl import ACL, UserACL


def lambda_handler(event, context):
    username = event.get('requestContext').get('authorizer').get('username')
    if not UserACL(username).has_acl("octopus","list-usergroups"):
        return {"statusCode":403, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    
    acl = ACL()
    groups = list(vars(acl).keys())
    # if user_group:    
    return {"statusCode":200, "body":dumps({"error":False, "data":{"groups":groups}}),
    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

    # return {"statusCode":403, "body":"",
    # "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
