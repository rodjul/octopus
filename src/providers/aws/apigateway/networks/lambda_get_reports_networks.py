import boto3
from datetime import date, datetime
from json import loads, dumps
from boto3.dynamodb.conditions import Key
from urllib.parse import unquote
import decimal
from utils import logs
from model.useracl import UserACL


def get_report(timestamp, type_request):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('octopus_aws_network_details_linked_accounts')
    # response = table.get_item(Key={"Username":username})
    response = table.query(IndexName='Timestamp-TypeRequest-index',KeyConditionExpression=Key('Timestamp').eq(timestamp) & Key('TypeRequest').eq(type_request) )
    if "Items" in response and response['Items']:
        return response['Items']
    return []


def decimal_default(obj):
    '''
    https://stackoverflow.com/a/16957370
    '''
    if isinstance(obj, decimal.Decimal):
        return float(obj)
    raise TypeError


def lambda_handler(event, context):
    username = event.get('requestContext').get('authorizer').get('username')
    if not UserACL(username).has_acl("aws","get-network-report"):
        return {"statusCode":403, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}    
    
    try:
        timestamp = unquote( event["pathParameters"]['timestamp'] )
        type_request = unquote( event["pathParameters"]['type_request'] )

        if not timestamp or not type_request or type_request.lower() not in ("ec2","rds","all"):
            return {"statusCode":400, "body":dumps({"error":True, "message": "Invalid"}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    except Exception as e:
        print(e)
        return {"statusCode":400, "body":dumps({"error":True, "message": "Invalid"}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

    format_data = {}

    if type_request.lower() == "all":
        ec2 = []
        report = get_report(timestamp, "ec2")
        for row in report:
            del row["UUID"]
        ec2 = report

        rds = []
        report = get_report(timestamp, "ec2")
        for row in report:
            del row["UUID"]
        ec2 = report

        format_data = {
            "report": {
                "ec2": ec2,
                "rds": rds,
            }
        }
    else:
        report = get_report(timestamp, type_request.lower())
        for row in report:
            del row["UUID"]
        
        format_data = {
            "report": report
        }
        
    # logs.write(event, "AWS",  200, "", "The date \"{report_date}\" of Network Report was requested".format(report_date=timestamp) )
    logs.write(event, "AWS", 200, event['body'], "Get Network Report", "")

    return {"statusCode":200, "body":dumps({"error":False, "data": format_data}, default=decimal_default),
    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
