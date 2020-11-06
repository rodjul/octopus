import boto3
from json import loads, dumps
from boto3.dynamodb.conditions import Attr, Key
from urllib.parse import unquote
from utils import logs
from model.useracl import UserACL


def get_all_policies_by_type(policy_type):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_policy")
    response = table.query(IndexName='Type-index',KeyConditionExpression=Key('Type').eq(policy_type))
    return response['Items']


def lambda_handler(event,context):
    username = event.get('requestContext').get('authorizer').get('username')
    if not UserACL(username).has_acl("aws","list-iam-policies"):
        return {"statusCode":403, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
        
    # print("Debug:",event)

    policies_db = get_all_policies_by_type("POLICY")
    trusts_db = get_all_policies_by_type("TRUST")
    roles_db = get_all_policies_by_type("ROLE")
    
    format_policy = []
    for policy in policies_db:
        format_policy.append({
            "policy_name": policy['PolicyName'],
            "type": policy['Type'],
            "data": policy['Data']
        })

    format_trust = []
    for policy in trusts_db:
        format_trust.append({
            "policy_name": policy['PolicyName'],
            "type": policy['Type'],
            "data": policy['Data']
        })
        
    format_role = []
    for policy in roles_db:
        format_role.append({
            "policy_name": policy['PolicyName'],
            "type": policy['Type'],
            "data": policy['Data']
        })

    output = {
        "policies": dumps(format_policy), 
        "trusts": dumps(format_trust) , 
        "roles": dumps(format_role) 
    }

    # logs.write(event, "AWS",  200, event['body'], "All IAM Policies were requested to list" )
    logs.write(event, "AWS", 200, "", "List IAM policies", "")

    return {"statusCode":200, "body":dumps({"error":False, "data": output}),
            "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

       