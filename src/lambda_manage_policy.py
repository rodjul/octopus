import boto3
from json import loads, dumps
from boto3.dynamodb.conditions import Attr

def insert_policy(policy_name, data_json):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_policy")

    item = {"PolicyName": policy_name,
            "Data": dumps(data_json, ensure_ascii=False)}

    table.put_item( Item=item )

def delete_policy(policy_name):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_policy")
    table.delete_item(Key={"PolicyName":policy_name})

def get_policy_by_name(policy_name):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_policy")
    return table.scan(FilterExpression=Attr("PolicyName").eq(policy_name))['Items']

def get_available_policies():
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_policy")
    content =  table.scan(AttributesToGet=['PolicyName'])['Items']
    list = []
    if content:
        list = [ p['PolicyName'] for p in content]
    return list


def lambda_handler(event,context):
    print("Debug:",event)

    if event['httpMethod'] == "GET":
        if event['resource'] == "/policy/{policy_name}":
            #'pathParameters': {'policy_name': 'check'},
            policy_name = event["pathParameters"]['policy_name']
            content = get_policy_by_name(policy_name)

            return {"statusCode":200, "body":dumps({"error":False, "policy":content}),
                    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

        elif event['resource'] == "/policy/available":
            content = get_available_policies()
            return {"statusCode":200, "body":dumps({"error":False, "policies":content}),
                    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    
    elif event['httpMethod'] == "POST":
        if event['resource'] == "/policy/update" or event['resource'] == "/policy/delete":
            try:
                policy_name = loads(event['body'])['policy_name']
                policy_data = ""
                if event['resource'] == "/policy/update":
                    policy_data = loads(event['body'])['policy_data']
            except KeyError:
                return {"statusCode":400, "body":dumps({"error":True, "message":"Params invalid"}),
                    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

            content = "ok"
            if event['resource'] == "/policy/update":
                insert_policy(policy_name, policy_data)
            else:
                delete_policy(policy_name)

            return {"statusCode":200, "body":dumps({"error":False, "policy":content}),
                    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

    return {"statusCode":200, "body":dumps({"error":False, "message":"ok"}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
