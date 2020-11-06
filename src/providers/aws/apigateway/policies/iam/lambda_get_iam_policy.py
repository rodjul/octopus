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
    if not UserACL(username).has_acl("aws","get-iam-policies"):
        return {"statusCode":403, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
        
    try:
        policy_type = unquote( event["pathParameters"]['policy_type'] ).upper()
        if policy_type not in ("POLICY","TRUST","ROLE"):
            return {"statusCode":400, "body":dumps({"error":True, "message":"Invalid parameters"}),
            "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
        
    except Exception as e:
        return {"statusCode":400, "body":dumps({"error":True, "message":"Invalid parameters"}),
            "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

    content = get_all_policies_by_type(policy_type)
    # content.sort()
    
    data_format = {
        "policies": content
    }

    # logs.write(event, "AWS",  200, event['body'], "The category \"{policy_type}\" of IAM Policy was requested to list".format(policy_type=policy_type) )
    logs.write(event, "AWS", 200, data_format, "Get IAM {type}".format(type=policy_type), "")

    return {"statusCode":200, "body":dumps({"error":False, "data":data_format}),
            "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
                            

