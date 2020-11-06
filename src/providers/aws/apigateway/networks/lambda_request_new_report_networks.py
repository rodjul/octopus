import boto3
from os import environ
from datetime import date, datetime
from json import loads, dumps
from utils import logs
from model.useracl import UserACL

def save_history(timestamp, type_request):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_network_details_linked_accounts_history")

    item = {
        "Timestamp": timestamp,
        "TypeRequest": type_request,
    }

    table.put_item( Item=item )


def lambda_handler(event, context):
    username = event.get('requestContext').get('authorizer').get('username')
    if not UserACL(username).has_acl("aws","create-network-report"):
        return {"statusCode":403, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

    lam = boto3.client("lambda")
    resp = lam.invoke(
        FunctionName=environ["LAMBDA_ORGANIZATION"],
        InvocationType="RequestResponse",
        LogType="Tail"
    )

    accounts = loads( loads(resp['Payload'].read().decode())['body'] )
    sqs_client = boto3.client("sqs")
    
    resources = ["ec2","rds"]

    date_action = datetime.utcnow().isoformat()

    for account in accounts['accounts']:
        for resource in resources:
            sqs_client.send_message(
                QueueUrl=environ['URL_SQS_DESCRIBE_NETWORK'],
                MessageBody=dumps({
                    "account_id": account['Id'], 
                    "email_account":account['Email'], 
                    "date_action": date_action,
                    "resource": resource,
                    "report": "main",
                    })
            )
    
    save_history(date_action, "ec2")
    save_history(date_action, "rds")

    # logs.write(event, "AWS",  200, "", "New Network Report was requested" )
    logs.write(event, "AWS", 200, event['body'], "New Network Report", "")

    return {"statusCode":200, "body":dumps({"error":False, "message":"Checking..."}),
    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
