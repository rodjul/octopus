import boto3
from json import loads, dumps
from boto3.dynamodb.conditions import Attr, Key
from urllib.parse import unquote


def insert_policy(policy_name, policy_type, data_json):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_policy")

    item = {"PolicyName": policy_name,
            "Type": policy_type,
            "Data": dumps(data_json, ensure_ascii=False)}

    table.put_item( Item=item )


def delete_policy(policy_name, policy_type):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_policy")
    table.delete_item(Key={"PolicyName":policy_name, "Type":policy_type})


def get_policy_by_name(policy_name):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_policy")
    return table.scan(FilterExpression=Attr("PolicyName").eq(policy_name))['Items']


def get_policies_by_type(policy_type):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_policy")
    content = table.scan(FilterExpression=Attr("Type").eq(policy_type))['Items']
    list = []
    if content:
        list = [ p['PolicyName'] for p in content]
    return list


def get_all_policies_by_type(policy_type):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_policy")
    response = table.query(IndexName='Type-index',KeyConditionExpression=Key('Type').eq(policy_type))
    return response['Items']


def delete_if_not_found(policy_type, object):
    policy_type = policy_type.upper()

    # search for all policies of type
    policies_db = get_all_policies_by_type(policy_type)
    # we do a comparation to find the item, if not found delete
    for policy_db in policies_db:
        found = False
        for policy in object:
            if policy_db['Type'] == policy_type:
                if "Name" in policy and policy_db['PolicyName'] == policy['Name']:
                    found = True
                    break
                if "role_name" in policy and policy_db['PolicyName'] == policy['role_name']:
                    found = True
                    break

        if not found:
            delete_policy(policy_db['PolicyName'],policy_type)


def get_all_policies():
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

    return {"statusCode":200, "body":dumps({"error":False, "data": output}),
            "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}


def get_policies_info_by_type(policy_type):
    content = get_all_policies_by_type(policy_type)
    content.sort()
    
    data_format = {
        "policies": content
    }

    return {"statusCode":200, "body":dumps({"error":False, "data":data_format}),
            "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}


def upsert_policies(policies, trusts, roles):
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

    for trust in trusts:
        policy_name = trust['trust_name']
        policy_type = "TRUST"
        data = {
            "Name": trust["trust_name"],
            "Description": trust['trust_description'],
            "AssumeRolePolicyDocument": trust["trust_assume_role_policy_document"]
        }            
        insert_policy(policy_name, policy_type, data)
    
    for role in roles:
        policy_name = role['role_name']
        policy_type = "ROLE"
        data = {
            "Name": role["role_name"],
            "Description": role['role_description'],
            "Policies": role["policies"],
            "TrustRelationship": role["trust_relationship"]
        }            
        insert_policy(policy_name, policy_type, data)   
    
    return {"statusCode":200, "body":dumps({"error":False, "policy":content}),
            "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}


def lambda_handler(event,context):
    # print("Debug:",event)

    if event['httpMethod'] == "GET":
        if event['resource'] == "/aws/policies":
            return get_all_policies()

        elif event['resource'] == "/aws/policies/{policy_type}":
            policy_type = unquote( event["pathParameters"]['policy_type'] ).upper()
            return get_policies_info_by_type(policy_type)                                    
    

    elif event['httpMethod'] == "PUT" and event['resource'] == "/aws/policies":
        try:
            body = loads(event['body'])
            policies = body['policies']
            trusts   = body['trusts_relationship']
            roles    = body['roles']
        except KeyError:
            return {"statusCode":400, "body":dumps({"error":True, "message":"Invalid parameters"}),
                "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
        except TypeError:
            return {"statusCode":400, "body":dumps({"error":True, "message":"Invalid parameters"}),
                "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

        return upsert_policies(policies, trusts, roles)
    
    
    elif event['httpMethod'] == "DELETE" and event['resource'] == '/providers/aws/policies/{policy_type}/{policy_name}':
        policy_type = unquote( event["pathParameters"]['policy_type'] ).upper()
        policy_name = unquote( event["pathParameters"]['policy_name'] )
        
        delete_policy(policy_name, policy_type)

        return {"statusCode":200, "body":dumps({"error":False, "message":"ok"}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    

    return {"statusCode":404, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
