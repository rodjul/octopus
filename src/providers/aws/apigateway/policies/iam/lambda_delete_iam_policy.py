import boto3
from json import loads, dumps
# from boto3.dynamodb.conditions import Attr, Key
from urllib.parse import unquote
from utils import logs
from model.useracl import UserACL


def delete_policy(policy_name, policy_type):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_policy")
    table.delete_item(Key={"PolicyName":policy_name, "Type":policy_type})



def lambda_handler(event,context):
    username = event.get('requestContext').get('authorizer').get('username')
    if not UserACL(username).has_acl("aws","delete-iam-policies"):
        return {"statusCode":403, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    
    try:
        policy_type = unquote( event["pathParameters"]['policy_type'] ).upper()
        policy_name = unquote( event["pathParameters"]['policy_name'] )
        if policy_type not in ("POLICY","TRUST","ROLE"):
            return {"statusCode":400, "body":dumps({"error":True, "message":"Invalid parameters"}),
            "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

    except Exception as e:
        return {"statusCode":400, "body":dumps({"error":True, "message":"Invalid parameters"}),
            "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    
    delete_policy(policy_name, policy_type)

    payload = str({"policy_name": policy_name, "policy_type":policy_type})
    # logs.write(event, "AWS",  200, payload, "The IAM Policy \"{policy_name}\" of category \"{policy_type}\" was deleted".format(policy_name=policy_name, policy_type=policy_type) )
    logs.write(event, "AWS", 200, payload, "Delete IAM {type}".format(type=policy_type), "")

    return {"statusCode":200, "body":dumps({"error":False, "message":"ok"}),
    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    

