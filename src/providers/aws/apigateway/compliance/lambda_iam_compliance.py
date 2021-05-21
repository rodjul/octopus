import boto3
import botocore
from model.iam_control import IamControl
from os import environ
from json import loads, dumps
import hashlib
import datetime 
from boto3.dynamodb.conditions import Attr, Key
from utils import logs
from model.useracl import UserACL


def insert_date(type_compliance, date_action):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_account_compliance_dates")

    item = {
        "DateAction": date_action+"-"+type_compliance.upper(),
    }

    table.put_item( Item=item )


def get_compliance_by_account(event):
    try:
        account_id = event['pathParameters']['account_id'] 
    except IndexError:
        return {"statusCode":400, "body":{"error":True, "message":"Key error param"}}
    
    s3 = boto3.client("s3")
    
    contents = s3.list_objects(
        Bucket=environ['octopus_resource'],
        Prefix="compliance/"+account_id
    )
    
    if "Contents" in contents and contents['Contents']:
        last = len(contents['Contents']) -1 
        last_key = contents['Contents'][last]['Key'] 
        content =  s3.get_object(Bucket=environ['octopus_resource'], Key=last_key)['Body'].read().decode()
        
        return {"statusCode":200, "body":dumps({"found":True, "message":content}, ensure_ascii=False),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
        
    return {"statusCode":200, "body":dumps({"found":False, "message":"Not found"}), 
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    

def get_date_actions():
    # obter todos as datas e dps retornar no json as datas disponiveis
    # obter da data mais recente quando na 1 vez
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_account_compliance_dates")
    response = table.scan(FilterExpression=Attr("DateAction").contains("IAM"))
    dates = []
    
    for item in response['Items']:
        dates.append('-'.join(item['DateAction'].split("-")[:3]))

    while 'LastEvaluatedKey' in response:
        response = table.scan(FilterExpression=Attr("DateAction").contains("IAM"),
                            ExclusiveStartKey=response['LastEvaluatedKey'])
        for item in response['Items']:
            dates.append('-'.join(item['DateAction'].split("-")[:3]))
    
    dates = list(set(dates))
    dates.sort()
    return dates


def get_compliance(event):
    try:
        date_input = event['queryStringParameters']['date_action']
        type_role = event['queryStringParameters']['type_role']
    except KeyError as e:
        print("Error in get param: ",e)
        return {"statusCode":400, "body":dumps({"error":True, "message":"Invalid parameters"}),
    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
        
    
    dates = get_date_actions()
    # if the value is null, get the lastest date available
    if date_input == "":
        try:
            date_input = dates[len(dates)-1]
        except IndexError:
            date_input = ""
    
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_account_compliance")
    
    content = ""
    if date_input != "":
        try:
            # response = table.scan(FilterExpression=Key("DateAction").eq(date_input+"-IAM") & Attr("TypeRole").eq(type_role))
            response = table.query(IndexName='DateAction-TypeRole-index',
                KeyConditionExpression=Key("DateAction").eq(date_input+"-IAM") & Key("TypeRole").eq(type_role))
            temp = []
            
            for row in response['Items']:
                temp.append(row)
            
            while 'LastEvaluatedKey' in response:
                response = table.query(IndexName='DateAction-TypeRole-index',
                                    KeyConditionExpression=Key("DateAction").eq(date_input+"-IAM") & Key("TypeRole").eq(type_role),
                                    ExclusiveStartKey=response['LastEvaluatedKey'])
                for row in response['Items']:
                    temp.append(row)

            content = temp
        except KeyError as e:
            print(e)
            content = ""
    
    logs.write(event, "AWS", 200, event['body'], "Get IAM Report", "Get report of date {date}".format(date=date_input))
    
    return {"statusCode":200, "body":dumps({"error":False, "dates_available":dates, "content": content}),
    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}


def get_dates_actions_available(event):
    dates = dates = get_date_actions()
    format_data = {
        "dates_available":dates
    }

    logs.write(event, "AWS", 200, event['body'], "Get dates of IAM Report", "List all available dates")

    return {"statusCode":200, "body":dumps({"error":False, "data": format_data}),
"headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}


def publish_sns_data_compliance(event):
    try:
        body = loads(event['body'])
        # "name","email":json_data[1].value,"cloudformation":json_data[2].value
        date_action = datetime.datetime.utcnow().isoformat()
        type_role = body['type_role']
    except KeyError:
        return {"statusCode":400,"body":dumps({"error":True, "message":"Invalid parameters"}),
            "headers":{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}}

    
    lam = boto3.client("lambda")
    resp = lam.invoke(
        FunctionName=environ["LAMBDA_ORGANIZATION"],
        InvocationType="RequestResponse",
        LogType="Tail"
    )
    # accounts = requests.get("https://o2u171afvl.execute-api.us-east-2.amazonaws.com/dev/account/organizations").json() 

    accounts = loads( loads(resp['Payload'].read().decode())['body'] )
    
    sqs_client = boto3.client("sqs")

    insert_date("IAM",date_action)

    for account in accounts['accounts']:
        sqs_client.send_message(
            QueueUrl=environ['URL_SQS_IAM'],
            MessageBody=dumps({
                "account_id": account['Id'], 
                "account_name":account['Name'], 
                "date_action": date_action,
                "type_role":type_role
                })
        )
    
    logs.write(event, "AWS", 200, event['body'], "New IAM Report", "")
    
    return {"statusCode":200, "body":dumps({"error":False, "message":"Checking..."}),
    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}


def lambda_handler(event, context):
    if event['httpMethod'] == "GET":
        if event['resource'] == "/aws/policiescompliance/iam/dates-available":
            username = event.get('requestContext').get('authorizer').get('username')
            if not UserACL(username).has_acl("aws","get-report-iam-compliance"):
                return {"statusCode":403, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
            return get_dates_actions_available(event)
    
        elif event['resource'] == "/aws/policiescompliance/iam/check":
            username = event.get('requestContext').get('authorizer').get('username')
            if not UserACL(username).has_acl("aws","get-report-iam-compliance"):
                return {"statusCode":403, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}            
            return get_compliance(event)

    elif event['httpMethod'] == "POST" and event['resource'] == "/aws/policiescompliance/iam":
        username = event.get('requestContext').get('authorizer').get('username')
        if not UserACL(username).has_acl("aws","create-iam-compliance"):
            return {"statusCode":403, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}        
        return publish_sns_data_compliance(event)
    
    return {"statusCode":404, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
