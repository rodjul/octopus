import boto3
from json import loads, dumps
# from boto3.dynamodb.conditions import Attr
from urllib.parse import unquote
# import re
from utils import logs
from model.useracl import UserACL


def delete_role_db(role_type):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_role_type")
    table.delete_item(Key={"RoleType":role_type})


def get_roleinfo_by_name(role_type):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_role_type")
    resp = table.get_item(Key={"RoleType":role_type})
    if "Item" in resp:
        return resp['Item']
    return {}



def lambda_handler(event,context):
    username = event.get('requestContext').get('authorizer').get('username')
    if not UserACL(username).has_acl("aws","delete-role-type"):
        return {"statusCode":403, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

    try:
        role_type = unquote( event["pathParameters"]['role_type'] )
    except KeyError:
        return {"statusCode":400, "body":dumps({"error":True, "message":"Invalid parameters"}),
            "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

    if not get_roleinfo_by_name(role_type):
        return {"statusCode":404, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

    delete_role_db(role_type)

    payload = str({"role_type":role_type})
    # logs.write(event, "AWS",  200, payload, "The Account Type \"{role_type}\" was deleted".format(role_type=role_type) )
    logs.write(event, "AWS", 200, payload, "Delete Role Account", "The role {role_type} was deleted".format(role_type=role_type))
    
    return {"statusCode":200, "body":dumps({"error":False, "message":"ok"}),
    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}



