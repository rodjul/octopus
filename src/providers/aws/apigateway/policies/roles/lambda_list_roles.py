import boto3
from json import loads, dumps
# from boto3.dynamodb.conditions import Attr
# from urllib.parse import unquote
# import re
from utils import logs
from model.useracl import UserACL


def get_available_rolestype():
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_role_type")
    response = table.scan()

    if "Items" in response:
        return response['Items']
    return []


def lambda_handler(event,context):
    username = event.get('requestContext').get('authorizer').get('username')
    if not UserACL(username).has_acl("aws","list-role-type"):
        return {"statusCode":403, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

    roles = get_available_rolestype()
    output = []
    for role in roles:
        data = {
            "roles": role['Roles'],
            "role_type": role['RoleType'],
            "description": role['Description'],
        }
        
        output.append( data )

    data_format = {
        "roles": output
    }

    # logs.write(event, "AWS",  200, event['body'], "List all Account Type available" )
    logs.write(event, "AWS", 200, data_format, "List Role Accounts", "")

    return {"statusCode":200, "body":dumps({"error":False, "data":data_format}),
            "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
