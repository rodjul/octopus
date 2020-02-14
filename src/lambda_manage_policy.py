import boto3
from json import loads, dumps
from boto3.dynamodb.conditions import Attr

def insert_policy(policy_name, policy_type, data_json):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_policy")

    item = {"PolicyName": policy_name,
            "Type": policy_type,
            "Data": dumps(data_json, ensure_ascii=False)}

    table.put_item( Item=item )

def delete_policy(policy_name, policy_type):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_policy")
    table.delete_item(Key={"PolicyName":policy_name, "Type":policy_type})

def get_policy_by_name(policy_name):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_policy")
    return table.scan(FilterExpression=Attr("PolicyName").eq(policy_name))['Items']

def get_policies_by_type(policy_type):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_policy")
    content = table.scan(FilterExpression=Attr("Type").eq(policy_type))['Items']
    list = []
    if content:
        list = [ p['PolicyName'] for p in content]
    return list

def get_all_policies_by_type(policy_type):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_policy")
    return table.scan(FilterExpression=Attr("Type").eq(policy_type))['Items']


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


def lambda_handler(event,context):
    print("Debug:",event)

    if event['httpMethod'] == "GET":
        if event['resource'] == "/policy/content":
            policies_db = get_all_policies_by_type("POLICY")
            trusts_db = get_all_policies_by_type("TRUST")
            roles_db = get_all_policies_by_type("ROLE")

            return {"statusCode":200, "body":dumps({"error":False, 
                    "policies": dumps(policies_db), "trusts": dumps(trusts_db) , "roles": dumps(roles_db) }),
                    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

        elif event['resource'] == "/policy/available/iam":
            content = get_policies_by_type("IAM")
            content.sort()

            return {"statusCode":200, "body":dumps({"error":False, "policies":content}),
                    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}  

        elif event['resource'] == "/policy/available/trust":
            content = get_policies_by_type("TRUST")
            content.sort()

            return {"statusCode":200, "body":dumps({"error":False, "policies":content}),
                    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}      

        elif event['resource'] == "/policy/available/role":
            content = get_policies_by_type("ROLE")
            content.sort()

            return {"statusCode":200, "body":dumps({"error":False, "policies":content}),
                    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}                                      
    

    elif event['httpMethod'] == "POST" and event['resource'] == "/policy/update":
        try:
            body = loads(event['body'])
            policies = body['policies']
            trusts   = body['trusts_relationship']
            roles    = body['roles']
        except KeyError:
            return {"statusCode":400, "body":dumps({"error":True, "message":"Params invalid"}),
                "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

        content = "ok"
        for policy in policies:
            policy_name = policy['Name']
            policy_type = "POLICY"
            insert_policy(policy_name, policy_type, policy)

        for trust in trusts:
            policy_name = trust['Name']
            policy_type = "TRUST"
            insert_policy(policy_name, policy_type, trust)
        
        for role in roles:
            policy_name = role['role_name']
            policy_type = "ROLE"
            insert_policy(policy_name, policy_type, role)   

        # search for all policies of type POLICY
        # we do a comparation to find the item, if not found delete
        delete_if_not_found("POLICY", policies)
        delete_if_not_found("TRUST" , trusts)
        delete_if_not_found("ROLE", roles)

        
        return {"statusCode":200, "body":dumps({"error":False, "policy":content}),
                "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    

    return {"statusCode":200, "body":dumps({"error":False, "message":"ok"}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
