import boto3
# from os import environ
# from datetime import date, datetime
from json import loads, dumps
from utils import logs
from model.useracl import UserACL
# import decimal


def update_user(username, user_group):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_users")

    table.update_item(
        Key={"Username":username},
        # UpdateExpression="set Description = :d, #Roles = :r",
        UpdateExpression="set UserGroup = :d",
        ExpressionAttributeValues={
            ':d': user_group,
            #':r': data_json,
        },
        # ExpressionAttributeNames={
        #     "#Roles":"Roles"
        # }
    )

def user_exists(username):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_users")
    resp = table.get_item(Key={"Username":username})
    if "Item" in resp and resp['Item']:
        return True
    return False


def lambda_handler(event, context):
    username = event.get('requestContext').get('authorizer').get('username')
    if not UserACL(username).has_acl("octopus","update-user"):
        return {"statusCode":403, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    
    try:
        users = loads(event['body'])['users']
        if not users or not len(users):
            return {"statusCode":400, "body":dumps({"error":True,"message":"Null values"}),"headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}    
    except KeyError:
        return {"statusCode":400, "body":dumps({"error":True,"message":"Invalid parameters"}),"headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

    for user in users:
        if user_exists(user['Username']):
            update_user(user['Username'],user['UserGroup'])
    
    logs.write(event, "OCTOPUS", 200, users, "Update User permissions", "")

    return {"statusCode":200, "body":dumps({"error":False, "message":"ok"}),
    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

