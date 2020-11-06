import boto3
from json import loads, dumps
from boto3.dynamodb.conditions import Attr, Key
from urllib.parse import unquote
from utils import logs
from model.useracl import UserACL


def insert_policy(policy_name, policy_type, data_json):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_policy")

    item = {"PolicyName": policy_name,
            "Type": policy_type,
            "Data": dumps(data_json, ensure_ascii=False)}

    table.put_item( Item=item )


def valid_parameters(iam_type, data):
    if iam_type == "POLICY":
        for policy in data:
            if not ("policy_name" in policy and "policy_description" in policy \
                    and "policy_path" in policy and "policy_document" in policy):
                return False

    elif iam_type == "TRUST":
        for trust in data:
            if not ("trust_name" in trust and "trust_description" in trust \
                    and "trust_assume_role_policy_document" in trust ):
                return False
    elif iam_type == "ROLE":
        for role in data:
            if not ("role_name" in role and "role_description" in role \
                    and "policies" in role and "trust_relationship" in role):
                return False
    return True


def exist_policy(iam_type, policy_name):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_policy")
    data = table.get_item(Key={"PolicyName": policy_name, "Type":iam_type.upper()})
    if "Item" in data and data["Item"]:
        return True
    return False


def valid_role(role):
    for policy in role["policies"]:
        if exist_policy("POLICY", policy):
            continue
        return False
    
    if not exist_policy("TRUST", role['trust_relationship']):
        return False
    
    return True


def lambda_handler(event,context):
    username = event.get('requestContext').get('authorizer').get('username')
    if not UserACL(username).has_acl("aws","update-iam-policies"):
        return {"statusCode":403, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    
    try:
        body = loads(event['body'])
        policies = body['policies']
        trusts   = body['trusts_relationship']
        roles    = body['roles']
        
        if not valid_parameters("POLICY", policies) or not valid_parameters("TRUST", trusts) \
            or not valid_parameters("ROLE", roles):
            logs.write(event, "AWS", 400, roles, "Update IAM ROLE", "Invalid parameters")
            return {"statusCode":400, "body":dumps({"error":True, "message":"Invalid parameters"}),
            "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

    except KeyError:
        return {"statusCode":400, "body":dumps({"error":True, "message":"Invalid parameters"}),
            "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    except TypeError:
        return {"statusCode":400, "body":dumps({"error":True, "message":"Invalid parameters"}),
            "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

    #Policies - Name, Description, Path, PolicyDocument
    #TrustRelationships - Name, AssumeRolePolicyDocument
    #Roles  - Name, Policies[], PolicyArnAWS[] , TrustRelationship
    content = "ok"

    for policy in policies:
        policy_name = policy['policy_name']
        policy_type = "POLICY"
        data = {
            "Name": policy["policy_name"],
            "Description": policy['policy_description'],
            "Path": policy["policy_path"],
            "PolicyDocument": policy["policy_document"]
        }
        insert_policy(policy_name, policy_type, data)

    logs.write(event, "AWS", 200, policies, "Update IAM POLICY", "")

    for trust in trusts:
        policy_name = trust['trust_name']
        policy_type = "TRUST"
        data = {
            "Name": trust["trust_name"],
            "Description": trust['trust_description'],
            "AssumeRolePolicyDocument": trust["trust_assume_role_policy_document"]
        }            
        insert_policy(policy_name, policy_type, data)
    
    logs.write(event, "AWS", 200, trusts, "Update IAM TRUST", "")
    
    for role in roles:
        policy_name = role['role_name']

        if not valid_role(role):
            logs.write(event, "AWS", 400, roles, "Update IAM ROLE", "IAM Role {role} contains invalid data".format(role=policy_name))
            return {"statusCode":400, "body":dumps({"error":True, "message":"IAM Role {role} contains invalid data".format(role=policy_name)}),
            "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

        policy_type = "ROLE"
        data = {
            "Name": role["role_name"],
            "Description": role['role_description'],
            "Policies": role["policies"],
            "TrustRelationship": role["trust_relationship"],
            "PolicyArnAWS": role.get("policy_arn_aws"),
        }

        insert_policy(policy_name, policy_type, data)   

    logs.write(event, "AWS", 200, roles, "Update IAM ROLE", "")
    
    return {"statusCode":200, "body":dumps({"error":False, "policy":content}),
            "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}


