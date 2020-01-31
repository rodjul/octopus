import boto3
from json import loads, dumps
from boto3.dynamodb.conditions import Attr

def insert_role(role_type, description, data_json):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_role_type")

    item = {"RoleType": role_type,
            "Description": description,
            "Roles": dumps(data_json, ensure_ascii=False)}

    table.put_item( Item=item )

def delete_role(role_type):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_role_type")
    table.delete_item(Key={"RoleType":role_type})

def get_roles_by_name(role_type):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_role_type")
    return table.scan(FilterExpression=Attr("RoleType").eq(role_type))['Items']

def get_available_rolestype():
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_role_type")
    content =  table.scan(AttributesToGet=['RoleType'])['Items']
    list = []
    if content:
        list = [ p['RoleType'] for p in content]
    return list


def lambda_handler(event,context):
    print("Debug:",event)

    if event['httpMethod'] == "GET":
        if event['resource'] == "/role/{role_type}":
            #'pathParameters': {'role_type': 'check'},
            role_type = event["pathParameters"]['role_type']
            content = get_roles_by_name(role_type)

            return {"statusCode":200, "body":dumps({"error":False, "type_role":content}),
                    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

        elif event['resource'] == "/role/available":
            content = get_available_rolestype()
            return {"statusCode":200, "body":dumps({"error":False, "type_roles":content}),
                    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    
    elif event['httpMethod'] == "POST" and event['resource'] == "/role/new":
        try:
            body = loads(event['body'])
            role_type = body['role_type']
            description = body['description']
            roles_data = body['roles']
        except KeyError:
            return {"statusCode":400, "body":dumps({"error":True, "message":"Params invalid"}),
                "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
        
        insert_role(role_type, description, roles_data)
        content = "ok"
        return {"statusCode":200, "body":dumps({"error":False, "message":content}),
                "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

    elif event['httpMethod'] == "PUT" and event['resource'] == "/role/update":
        try:
            role_type = loads(event['body'])['role_type']
        except KeyError:
            return {"statusCode":400, "body":dumps({"error":True, "message":"Params invalid"}),
                "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

        content = "ok"
        # insert_role(role_type, policy_data)
        return {"statusCode":200, "body":dumps({"error":False, "message":content}),
                "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}            
    
    elif event['httpMethod'] == "DELETE" and event['resource'] == "/role/delete":
        try:
            role_type = loads(event['body'])['role_type']
        except KeyError:
            return {"statusCode":400, "body":dumps({"error":True, "message":"Params invalid"}),
                "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
        delete_role(role_type)
        
        return {"statusCode":200, "body":dumps({"error":False, "message":"ok"}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}



    return {"statusCode":200, "body":dumps({"error":False, "message":"ok"}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
