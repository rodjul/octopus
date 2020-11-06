import boto3
from json import loads, dumps
from boto3.dynamodb.conditions import Attr
from urllib.parse import unquote
import re

def insert_role(role_type, description, data_json):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_role_type")

    item = {"RoleType": role_type,
            "Description": description,
            "Roles": data_json}

    table.put_item( Item=item )


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


def is_parameters_valid(rolestype):
    for role in rolestype:
        if not ("role_type_name" in role and "description" in role and "roles" in role):
            return False
    return True


def get_all_roles():
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
    return {"statusCode":200, "body":dumps({"error":False, "data":data_format}),
            "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}


def get_role_type_info(role_type):
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

    return {"statusCode":200, "body":dumps({"error":False, "data":data_format}),
            "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}


def update_roles(roles_data):
    for role in roles_data:
        print(role)
        name = role['name']
        description = "Description of this role" if "description" not in role else role['description']
        roles = role['roles']
        insert_role(name, description, roles)
    content = "ok"
    return {"statusCode":200, "body":dumps({"error":False, "message":content}),
            "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}


def upsert_roles(rolestype):
    for role in rolestype:
        match = "\\s+|[.,/#!$%^&*;:{}=`~()@¨'\"+[\\]`´]"
        filter_name = re.sub(match,"",role['role_type_name'])

        roles_list = role['roles']
        if not type(roles_list) == list:
            roles_list = list(roles_list)
        update_role_db(filter_name, role['description'], roles_list)

    content = "ok"
    return {"statusCode":200, "body":dumps({"error":False, "message":content}),
            "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}   


def lambda_handler(event,context):
    # print("Debug:",event)
    if event['httpMethod'] == "GET":
        if event['resource'] == "/aws/roles/{role_type}":
            #'pathParameters': {'role_type': 'check'},
            role_type = unquote( event["pathParameters"]['role_type'] )
            return get_role_type_info(role_type)

        elif event['resource'] == "/aws/roles":
            return get_all_roles()

    
    elif event['httpMethod'] == "POST" and event['resource'] == "/role/new" or event['resource'] == "/role/update":
        try:
            roles_data = loads(event['body'])
        except KeyError:
            return {"statusCode":400, "body":dumps({"error":True, "message":"Invalid parameters"}),
                "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
        
        if len(roles_data)==0:
            return {"statusCode":400, "body":dumps({"error":True, "message":"Params blank"}),
                "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
        
        for role in roles_data:
            if "name" not in role or "roles" not in role:
                return {"statusCode":400, "body":dumps({"error":True, "message":"Params blank"}),
            "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
        
        return update_roles(roles_data)

    
    elif event['httpMethod'] == "PUT" and event['resource'] == "/aws/roles":
        try:
            body = loads(event['body'])
            rolestype = body['rolestype']
            
            valid = is_parameters_valid(rolestype)
            if not valid:
                return {"statusCode":400, "body":dumps({"error":True, "message":"Invalid parameters"}),
                "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

            exists = has_roletype_created(rolestype)
            if exists:
                return {"statusCode":400, "body":dumps({"error":True, "message":"Invalid parameters"}),
                "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
                        
        except KeyError:
            return {"statusCode":400, "body":dumps({"error":True, "message":"Invalid parameters"}),
                "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

        return upsert_roles(rolestype)         
    
    
    elif event['httpMethod'] == "DELETE" and event['resource'] == "/aws/roles/{role_type}":
        try:
            role_type = unquote( event["pathParameters"]['role_type'] )
        except KeyError:
            return {"statusCode":400, "body":dumps({"error":True, "message":"Invalid parameters"}),
                "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

        if not get_roleinfo_by_name(role_type):
            return {"statusCode":404, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

        delete_role_db(role_type)
        
        return {"statusCode":200, "body":dumps({"error":False, "message":"ok"}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}



    return {"statusCode":404, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
