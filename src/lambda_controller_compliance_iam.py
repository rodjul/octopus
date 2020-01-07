import boto3
from json import loads, dumps
from boto3.dynamodb.conditions import Attr
from os import environ

def lambda_handler(event,context):
    print("Debug:",event)
    try:
        body = loads(event['body'])
        # "name","email":json_data[1].value,"cloudformation":json_data[2].value
        account_id = body['account_id']
    except KeyError:
        return {"statusCode":400,"body":dumps({"error":True, "message":"params invalid"}),
            "headers":{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}}

    sqs_client = boto3.client("sqs")
    sqs_client.send_message(
            QueueUrl=environ['URL_SQS'],
            MessageBody=dumps({"account_id": account_id})
        )   
    
    return {"statusCode":200, "body":dumps({"error":False, "message":"Checking..."}),
    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
