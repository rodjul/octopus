import boto3
from json import dumps, loads
from os import environ

def lambda_handler(event,context):
    file_key = "roles_policies_trusts.json"
    print("Debug: ",event)
    s3 = boto3.resource('s3')
    obj = s3.Object(environ['octopus_resource'], file_key)
    content_json = loads(obj.get()['Body'].read().decode('utf-8') )
    
    return {"statusCode":200, "body":dumps({"error":False, "message":content_json},  separators=(',',':') ),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

