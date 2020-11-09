import boto3
from os import environ
from datetime import date, datetime
from json import loads, dumps
from utils import logs
from model.useracl import UserACL


def new_user(username, name, usergroup):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_users")

    # resp = table.get_item(Item={"username":username})
    # if "Item" in resp and resp['Item']:
    #     return resp['Item']
    item = {
        "Username": username,
        "Name": name,
        "UserGroup": usergroup.upper(),
        "FirstLogin": datetime.utcnow().isoformat(),
    }

    table.put_item( Item=item )

def lambda_handler(event, context):
    print("Event:",event)
    username = event.get('requestContext').get('authorizer').get('username')
    name = event.get('requestContext').get('authorizer').get('name')
    group = UserACL(username).group
    if not group:
        logs.write(event, "OCTOPUS", 200, event.get('requestContext').get('authorizer'), "First time login", "")
        group = "READER"
        new_user(username, name, "READER")
    
    logs.write(event, "OCTOPUS", 200, event.get('requestContext').get('authorizer'), "Get user permissions", "")
    return {"statusCode":200, "body":dumps({"error":False, "data":{"acl":group}}),
    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

    # return {"statusCode":403, "body":"",
    # "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
