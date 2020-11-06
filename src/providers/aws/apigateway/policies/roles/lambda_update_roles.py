import boto3
from json import loads, dumps
from boto3.dynamodb.conditions import Attr
from urllib.parse import unquote
import re
from utils import logs
from model.useracl import UserACL


def update_role_db(role_type, description, data_json):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_role_type")
    table.update_item(
        Key={"RoleType":role_type},
        UpdateExpression="set Description = :d, #Roles = :r",
        ExpressionAttributeValues={
            ':d': description,
            ':r': data_json,
        },
        ExpressionAttributeNames={
            "#Roles":"Roles"
        }
    )



def has_roletype_created(rolestype):
    available_roles = get_available_rolestype()
    for role in rolestype:
        for role_db in available_roles:
            if role['role_type_name'] == role_db['RoleType']:
                return True
    return False


def get_available_rolestype():
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_role_type")
    response = table.scan()

    if "Items" in response:
        return response['Items']
    return []


def is_parameters_valid(event, rolestype):
    for role in rolestype:
        if not ("role_type_name" in role and "description" in role and ("roles" in role and role['roles'])):
            logs.write(event, "AWS", 400, role, "Role Account Invalid Parameters", "The parameter contains invalid data to update role")
            return False
    return True


def lambda_handler(event,context):
    username = event.get('requestContext').get('authorizer').get('username')
    if not UserACL(username).has_acl("aws","update-role-type"):
        return {"statusCode":403, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
        
    try:
        body = loads(event['body'])
        rolestype = body['rolestype']
        
        valid = is_parameters_valid(event, rolestype)
        if not valid:
            return {"statusCode":400, "body":dumps({"error":True, "message":"Invalid parameters"}),
            "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

        # exists = has_roletype_created(rolestype)
        # if exists:
        #     return {"statusCode":400, "body":dumps({"error":True, "message":"Role inserted already exists"}),
        #     "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
                    
    except KeyError:
        return {"statusCode":400, "body":dumps({"error":True, "message":"Invalid parameters"}),
            "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

    for role in rolestype:
        match = "\\s+|[.,/#!$%^&*;:{}=`~()@¨'\"+[\\]`´]"
        filter_name = re.sub(match,"",role['role_type_name'])

        roles_list = role['roles']
        if not type(roles_list) == list:
            roles_list = list(roles_list)
        update_role_db(filter_name, role['description'], roles_list)
        
        logs.write(event, "AWS", 200, {"role_name":filter_name, "roles":roles_list}, "Update Role Account", "")

    # logs.write(event, "AWS",  200, event['body'], "Role of Account Type was updated" )
    # logs.write(event, "AWS", 200, data_format, "List Role Accounts", "")

    content = "ok"
    return {"statusCode":200, "body":dumps({"error":False, "message":content}),
            "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}          
    
    