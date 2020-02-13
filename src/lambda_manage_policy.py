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
    table.delete_item(Key={"PolicyName":policy_name},
        ConditionExpression="#Type = :t",
        ExpressionAttributeNames={"#Type":"Type"},
        ExpressionAttributeValues={":t":policy_type}
    )

def get_policy_by_name(policy_name):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_policy")
    return table.scan(FilterExpression=Attr("PolicyName").eq(policy_name))['Items']

def get_available_policies_iam():
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_policy")
    content = table.scan(FilterExpression=Attr("Type").eq("POLICY"))['Items']
    list = []
    if content:
        list = [ p['PolicyName'] for p in content]
    return list

def get_available_policies_trust():
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_policy")
    content = table.scan(FilterExpression=Attr("Type").eq("TRUST"))['Items']
    list = []
    if content:
        list = [ p['PolicyName'] for p in content]
    return list

def get_all_policies_by_type(policy_type):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_policy")
    return table.scan(FilterExpression=Attr("Type").eq(policy_type))['Items']


def lambda_handler(event,context):
    print("Debug:",event)

    if event['httpMethod'] == "GET":
        if event['resource'] == "/policy/content":
            policies_db = get_all_policies_by_type("POLICY")
            trusts_db = get_all_policies_by_type("TRUST")

            return {"statusCode":200, "body":dumps({"error":False, 
                    "policies": dumps(policies_db), "trusts": dumps(trusts_db) }),
                    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

        elif event['resource'] == "/policy/available/iam":
            content = get_available_policies_iam()
            content.sort()

            return {"statusCode":200, "body":dumps({"error":False, "policies":content}),
                    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}  

        elif event['resource'] == "/policy/available/trust":
            content = get_available_policies_trust()
            content.sort()

            return {"statusCode":200, "body":dumps({"error":False, "policies":content}),
                    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}                                      
    

    elif event['httpMethod'] == "POST" and event['resource'] == "/policy/update":
        try:
            body = loads(event['body'])
            policies = body['policies']
            trusts   = body['trusts_relationship']
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

        # search for all policies of type POLICY
        policies_db = get_all_policies_by_type("POLICY")
        # we do a comparation to find the item, if not found delete
        for policy_db in policies_db:
            found = False
            for policy in policies:
                if policy_db['PolicyName'] == policy['Name']:
                    found = True
                    break

            if not found:
                delete_policy(policy_db['PolicyName'],"POLICY")
        
        # search for all policies of type TRUST
        trusts_db = get_all_policies_by_type("TRUST")
        # we do a comparation to find the item, if not found delete
        for trust_db in trusts_db:
            found = False
            for trust in trusts:
                if trust_db['PolicyName'] == trust['Name']:
                    found = True
                    break

            if not found:
                delete_policy(trust_db['PolicyName'],"TRUST")

        return {"statusCode":200, "body":dumps({"error":False, "policy":content}),
                "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    

    return {"statusCode":200, "body":dumps({"error":False, "message":"ok"}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
