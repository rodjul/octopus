#import requests
import boto3
from json import loads, dumps
from boto3.dynamodb.conditions import Attr
from datetime import datetime
from os import environ

def login(username, password):
    cidp = boto3.client('cognito-idp')
    try:
        r = cidp.initiate_auth(
            AuthFlow='USER_PASSWORD_AUTH',
            AuthParameters={
                'USERNAME': username,
                'PASSWORD': password},
            ClientId=environ['APP_CLIENT_ID'])
            #'AuthenticationResult': {'AccessToken': '', 'ExpiresIn': 3600, 'TokenType': 'Bearer', 'RefreshToken': '', 'IdToken': ''}
        return r['AuthenticationResult']['IdToken']
    except Exception:
        return "Not Authorized"

def get_ip_registed_from_application(username):
    return True
    # # pega o ip source de restricao da aplicacao 
    # dynamodb = boto3.resource('dynamodb')
    # table = dynamodb.Table("authvs_applications")
    
    # try:
    #     return table.scan(FilterExpression=Attr("ApplicationName").eq(username))['Items'][0]['IpSource']
    # except Exception as e:
    #     return "Not found"


def write_log(application_name, action, message):
    return ""
    # # pega o ip source de restricao da aplicacao 
    # dynamodb = boto3.resource('dynamodb')
    # table = dynamodb.Table("authvs_logs")
    
    # item = {"Timestamp": datetime.utcnow().replace(microsecond=0).isoformat(),
    #         "ApplicationName": application_name,
    #         "Action": action,
    #         "Message": message
    #         }

    # table.put_item( Item=item )


def lambda_handler(event, context):
    print("Debug: ",event)
    try:
        username = loads(event['body'])['username']
        password = loads(event['body'])['password']
        # username = "cognito-py-demo"
        # password = "D0lphins!"

    except Exception:
        return {"statusCode":400, "body":dumps({"error":True, "message":"Invalid parameters"}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    
    # username = "cognito-py-demo"
    # password = "D0lphins!"

    id_token = login(username, password)
    if id_token == "Not Authorized":
        write_log(username, "Login invalid", "Username or password does not match")
        return {"statusCode":200, "body":dumps({"error":True, "message":"Username or password invalid"}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    
    return {"statusCode":200, "body":dumps({"error":False, "message":"Connected", "authorization":id_token}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    
    ip_source_application = get_ip_registed_from_application(username)
    if ip_source_application == event['requestContext']['identity']['sourceIp'] \
        or ip_source_application == "any":
        write_log(username, "Authenticated", "Connected")
        return {"statusCode":200, "body":dumps({"error":False, "message":"Connected", "authorization":id_token}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

    write_log(username, "IP Source invalid", "Application connected using an invalid IP Address. Ip:" + event['requestContext']['identity']['sourceIp'] )
    return {"statusCode":200, "body":dumps({"error":False, "message":"Origin not authorized"}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}



    