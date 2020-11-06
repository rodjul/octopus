import boto3
import json
import decimal
import datetime
from utils import logs
from model.useracl import UserACL


def list_iam_projects():
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_gcp_iam_policy")

    rows = table.scan()['Items']

    utc_now = int(datetime.datetime.utcnow().timestamp())
    filter_data = []
    for row in rows:
        if utc_now <= int(row['expiration_ttl']):
            filter_data.append(row)
    return filter_data


def decimal_default(obj):
    '''
    https://stackoverflow.com/a/16957370
    '''
    if isinstance(obj, decimal.Decimal):
        return float(obj)
    raise TypeError


def lambda_handler(event, context):
    username = event.get('requestContext').get('authorizer').get('username')
    if not UserACL(username).has_acl("gcp","list-iam-policy-project"):
        return {"statusCode":403, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    
    iam_projects = list_iam_projects()

    logs.write(event, "GCP", 200, "", "List IAM Policy Project", "" )

    return {"statusCode":200, "body": json.dumps({"error":False, "data": iam_projects}, default=decimal_default),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

