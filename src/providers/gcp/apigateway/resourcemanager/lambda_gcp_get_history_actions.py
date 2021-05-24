import boto3
from json import loads, dumps
from boto3.dynamodb.conditions import Attr, Key
from urllib.parse import unquote
from os import environ
import re
from utils import logs
# from model.dynamodb import save_account_db
from model.useracl import UserACL


def list_history_actions():
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_gcp_history_changes_resource_manager")
    resp = table.scan()
    return resp['Items']



def lambda_handler(event, context):
    username = event.get('requestContext').get('authorizer').get('username')
    if not UserACL(username).has_acl("gcp","list-history-actions-logs"):
        return {"statusCode":403, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    
    histories = list_history_actions()

    logs.write(event, "GCP", 200, event['body'], "List history actions in Resource Manager", "" )

    return {"statusCode":200, "body":dumps({"error":False, "logs": histories}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
