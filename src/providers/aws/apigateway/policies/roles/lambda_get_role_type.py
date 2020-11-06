import boto3
from json import loads, dumps
# from boto3.dynamodb.conditions import Attr
from urllib.parse import unquote
# import re
from utils import logs
from model.useracl import UserACL


def get_roleinfo_by_name(role_type):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_role_type")
    resp = table.get_item(Key={"RoleType":role_type})
    if "Item" in resp:
        return resp['Item']
    return {}


def lambda_handler(event,context):
    username = event.get('requestContext').get('authorizer').get('username')
    if not UserACL(username).has_acl("aws","get-role-type"):
        return {"statusCode":403, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
        
    try:
        role_type = unquote( event["pathParameters"]['role_type'] )
    except Exception as e:
        return {"statusCode":400, "body":dumps({"error":True, "message":"Invalid parameters"}),
                "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

    content = get_roleinfo_by_name(role_type)

    output = {}
    if content:
        output = {
            "roles": content['Roles'],
            "role_type": content['RoleType'],
            "description": content['Description'],
        }
    
    data_format = {
        "role": output
    }

    # logs.write(event, "AWS",  200, event['body'], "Account Type \"{role_type}\" was requested".format(role_type=role_type) )
    logs.write(event, "AWS", 200, data_format, "Get Role Account {role_type}".format(role_type=role_type), "")

    return {"statusCode":200, "body":dumps({"error":False, "data":data_format}),
            "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

    #'pathParam