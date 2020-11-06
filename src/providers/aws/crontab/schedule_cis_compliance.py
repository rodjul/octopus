import boto3
from json import loads, dumps
from boto3.dynamodb.conditions import Attr
from os import environ
from datetime import datetime
import requests

def insert_date(type_compliance, date_action):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_account_compliance_dates")

    item = {
        "DateAction": date_action+"-"+type_compliance.upper(),
    }

    table.put_item( Item=item )

def lambda_handler(event,context):
    date_action = datetime.utcnow().strftime("%d%m%Y")

    lam = boto3.client("lambda")
    resp = lam.invoke(
        FunctionName=environ["LAMBDA_ORGANIZATION"],
        InvocationType="RequestResponse",
        LogType="Tail"
    )
    # accounts = requests.get("https://o2u171afvl.execute-api.us-east-2.amazonaws.com/dev/account/organizations").json() 

    accounts = loads( loads(resp['Payload'].read().decode())['body'] )
    
    sqs_client = boto3.client("sqs")

    insert_date("CIS",date_action)
        
    for account in accounts['accounts']:
        sqs_client.send_message(
            QueueUrl=environ['URL_SQS_CIS'],
            MessageBody=dumps({
                "account_id": account['Id'], 
                "account_name":account['Name'], 
                "date_action": date_action
                })
        )
    
    