import boto3
from json import loads, dumps
from boto3.dynamodb.conditions import Attr
from os import environ
from datetime import datetime
import requests

sample = {"accounts": [{"Id": "350819178402", "Arn": "arn:aws:organizations::210272193452:account/o-wy7lic8hzm/350819178402", "Email": "licenseserversm2plataforma.aws@cloudtotvs.com.br", "Name": "licenseserversm2plataforma.aws", "Status": "ACTIVE", "JoinedMethod": "CREATED"}, {"Id": "240932178171", "Arn": "arn:aws:organizations::210272193452:account/o-wy7lic8hzm/240932178171", "Email": "octopus.teste-8@cloudtotvs.com.br", "Name": "octopus.teste-8", "Status": "ACTIVE", "JoinedMethod": "CREATED"}, {"Id": "069512972055", "Arn": "arn:aws:organizations::210272193452:account/o-wy7lic8hzm/069512972055", "Email": "C84A44.aws@cloudtotvs.com.br", "Name": "C84A44.aws", "Status": "ACTIVE", "JoinedMethod": "INVITED"}, {"Id": "961360804028", "Arn": "arn:aws:organizations::210272193452:account/o-wy7lic8hzm/961360804028", "Email": "service.plataformabkp.aws@cloudtotvs.com.br", "Name": "service.buckets1.aws", "Status": "ACTIVE", "JoinedMethod": "CREATED"}, {"Id": "367386392375", "Arn": "arn:aws:organizations::210272193452:account/o-wy7lic8hzm/367386392375", "Email": "service.buckets16.aws@cloudtotvs.com.br", "Name": "service.buckets16.aws", "Status": "ACTIVE", "JoinedMethod": "CREATED"}]}


def lambda_handler(event,context):
    print("Debug:",event)
    try:
        body = loads(event['body'])
        # "name","email":json_data[1].value,"cloudformation":json_data[2].value
        date_action = body['date_action']
    except KeyError:
        return {"statusCode":400,"body":dumps({"error":True, "message":"params invalid"}),
            "headers":{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}}

    today = str(datetime.now().strftime("%d%m%Y"))
    try:
        date_input = datetime.strptime(date_action,"%d%m%Y")
    except Exception as e:
        print("Date invalid: ",e)
        date_input = ""
    finally:
        # if one of the conditions matches, we set the date_action to today
        if today != date_input or date_input == "":
            date_action = today
    
    accounts = requests.get("https://dq8yro2vbd.execute-api.us-east-2.amazonaws.com/dev/account/organizations").json() 
    
    sqs_client = boto3.client("sqs")
    for account in accounts['accounts']:
    
        sqs_client.send_message(
            QueueUrl=environ['URL_SQS'],
            MessageBody=dumps({"account_id": account['Id'], "account_name":account['Name'], "date_action": date_action})
        )   
    
    return {"statusCode":200, "body":dumps({"error":False, "message":"Checking..."}),
    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
