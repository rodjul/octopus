import boto3
from json import loads, dumps
from boto3.dynamodb.conditions import Attr, Key
from urllib.parse import unquote
from os import environ
import re
from utils import logs
# from model.dynamodb import save_account_db
import uuid
from model.useracl import UserACL
from datetime import datetime


def save_account_db(account_name, account_email, motive, account_type, account_payer):
    '''
    Insert the name account create to make the index
    '''
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_account")
    
    uuid_set = str(uuid.uuid4())

    item = {
        "UUID": uuid_set,
        "AccountName": account_name,
        "AccountEmail": account_email,
        "AccountType": account_type,
        "AccountPayer": account_payer,
        "Motive": motive,
        "AccountStatus": "NOT_CREATED",
        "Timestamp": datetime.utcnow().isoformat()
    }

    table.put_item( Item=item )

    return uuid_set


def account_created(account_name,account_email):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_account")
    response = table.query(
        IndexName="AccountEmail-AccountName-index", 
        KeyConditionExpression=Key("NameAccount").eq(account_name) & Key("EmailAccount").eq(account_email) 
    )
    
    status = False
    if response['Items']:
        #account_id = response['Items'][0]['AccountId']
        status = True
    
    return status


def get_info_account(uuid):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_account")
    resp = table.get_item(Key={"UUID": uuid})
    if "Item" in resp:
        return resp['Item']
    return ""


def get_roleinfo_by_name(role_type):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_role_type")
    resp = table.get_item(Key={"RoleType":role_type})
    if "Item" in resp:
        return resp['Item']
    return {}


def lambda_handler(event,context):
    username = event.get('requestContext').get('authorizer').get('username')
    if not UserACL(username).has_acl("aws","create-account"):
        return {"statusCode":403, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    return {"statusCode":200, "body":dumps({"error":False, "data":{"uuid":"542e1dca-d31c-4112-9ead-20afa310a31a"}, "message":"Creating account"}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    try:
        body = loads(event['body'])
        # "name","email":json_data[1].value,"cloudformation":json_data[2].value
        name = body['name']
        email = body['email']
        account_type = body['account_type']
        motive = body['motive']
        #account_payer = body['account_payer']
        account_payer = "brasileira"

        # check email regex
        if not re.match("[^@]+@[^@]+\.[^@]+", email):
            logs.write(event, "AWS", 400, event['body'], "New account with invalid parameters", "The email value is invalid" )
            return {"statusCode":400,"body":dumps({"error":True, "message":"Invalid email"}),
            "headers":{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}}
        
        # check if exsists account_type
        if not get_roleinfo_by_name(account_type):
            logs.write(event, "AWS", 400, event['body'], "New account with invalid parameters", "The Role set to this account does not exists" )
            return {"statusCode":400,"body":dumps({"error":True, "message":"Role type does not exists"}),
            "headers":{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}}

        if not motive or not name:
            logs.write(event, "AWS", 400, event['body'], "New account with invalid parameters", "Empty values informed" )
            return {"statusCode":400,"body":dumps({"error":True, "message":"Empty values are not allowed"}),
            "headers":{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}}
        
        if not (account_payer.lower() == "brasileira" or account_payer.lower() == "americana"):
            logs.write(event, "AWS", 400, event['body'], "New account with invalid parameters", "Empty values informed" )
            return {"statusCode":400,"body":dumps({"error":True, "message":"Empty values are not allowed"}),
            "headers":{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}}

    except KeyError:
        return {"statusCode":400,"body":dumps({"error":True, "message":"Invalid parameters"}),
            "headers":{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}}
    
    if not account_created(name,email):
        print("Criando conta", name,email)
        uuid = save_account_db(name, email, motive, account_type, account_payer)
        sqs_client = boto3.client("sqs")
        sqs_client.send_message(
                QueueUrl=environ['SQS_CREATE_ACCOUNT'],
                MessageBody=dumps({
                    "uuid":uuid, 
                    "name": name, 
                    "email":email,
                    "account_type": account_type, 
                    "account_payer": account_payer 
                })
            )
        
        logs.write(event, "AWS", 200, event['body'], "New account", "A new account is being created in AWS" )

        return {"statusCode":200, "body":dumps({"error":False, "data":{"uuid":uuid}, "message":"Creating account"}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

    return {"statusCode":200, "body":dumps({"error":True, "message":"Already created"}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}


    # elif event['httpMethod'] == "GET" and event['resource'] == "/providers/aws/accounts/{account_uid}/status":
    #     account_uid = unquote( event["pathParameters"]['account_uid'] )
        
    #     info = get_info_account(account_uid)
    #     if "Status" in info and info['Status']:
    #         if info['Status'] == "SUCCESSFULY CREATED":
    #             return {"statusCode":200, "body":dumps({"error":False, "data":{"account_id": info['AccountId']}, "message":"created"}),
    #         "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

    #         return {"statusCode":200, "body":dumps({"error":False, "message": info['Status']}),
    #         "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
        
    # return {"statusCode":404, "body":"", "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}