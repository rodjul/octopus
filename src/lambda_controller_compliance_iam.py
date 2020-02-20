import boto3
from json import loads, dumps
from boto3.dynamodb.conditions import Attr
from os import environ
from datetime import datetime
import requests


def lambda_handler(event,context):
    print("Debug:",event)
    try:
        body = loads(event['body'])
        # "name","email":json_data[1].value,"cloudformation":json_data[2].value
        date_action = body['date_action']
        type_role = body['type_role']
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
    
    lam = boto3.client("lambda")
    resp = lam.invoke(
        FunctionName=environ["LAMBDA_ORGANIZATION"],
        InvocationType="RequestResponse",
        LogType="Tail"
    )
    # accounts = requests.get("https://o2u171afvl.execute-api.us-east-2.amazonaws.com/dev/account/organizations").json() 

    accounts = loads( loads(resp['Payload'].read().decode())['body'] )
    
    sqs_client = boto3.client("sqs")

    if event['resource'] == "/policy/compliance/iam/new":
        for account in accounts['accounts']:
            sqs_client.send_message(
                QueueUrl=environ['URL_SQS_IAM'],
                MessageBody=dumps({
                    "account_id": account['Id'], 
                    "account_name":account['Name'], 
                    "date_action": date_action,
                    "type_role":type_role
                    })
            )
    elif event['resource'] == "/policy/compliance/cis/new":
        for account in accounts['accounts']:
            sqs_client.send_message(
                QueueUrl=environ['URL_SQS_CIS'],
                MessageBody=dumps({
                    "account_id": account['Id'], 
                    "account_name":account['Name'], 
                    "date_action": date_action
                    })
            )
    
    return {"statusCode":200, "body":dumps({"error":False, "message":"Checking..."}),
    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
