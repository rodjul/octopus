import boto3
import botocore
from os import environ
from json import loads, dumps
import hashlib
import datetime 
from boto3.dynamodb.conditions import Key,Attr
from utils import logs
from model.useracl import UserACL


def insert_date(type_compliance, date_action):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_account_compliance_dates")

    item = {
        "DateAction": date_action+"-"+type_compliance.upper(),
    }

    table.put_item( Item=item )


def get_date_actions():
    # obter todos as datas e dps retornar no json as datas disponiveis
    # obter da data mais recente quando na 1 vez
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_account_compliance_dates")
    response = table.scan(FilterExpression=Attr("DateAction").contains("CIS"))
    dates = []
    
    for item in response['Items']:
        dates.append('-'.join(item['DateAction'].split("-")[:3]))

    while 'LastEvaluatedKey' in response:
        response = table.scan(FilterExpression=Attr("DateAction").contains("CIS"),
                            ExclusiveStartKey=response['LastEvaluatedKey'])
        for item in response['Items']:
            dates.append('-'.join(item['DateAction'].split("-")[:3]))

    dates = list(set(dates))
    dates.sort()
    return dates


def get_dates_available(event):
    dates = get_date_actions()
    format_data = {
        "dates_available":dates
    }

    logs.write(event, "AWS", 200, event['body'], "Get dates of CIS Report", "List all available dates")
    
    return {"statusCode":200, "body":dumps({"error":False, "data": format_data }),
"headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}


def get_compliance(event):
    try:
        date_input = event['queryStringParameters']['date_action']
    except KeyError as e:
        print("Error in get param: ",e)
        return {"statusCode":400, "body":dumps({"error":True, "message":"Invalid parameters"}),
    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    except Exception as e:
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
            # response = table.scan(FilterExpression=Key("DateAction").eq(date_input+"-CIS"))
            response = table.query(IndexName='DateAction-index',
                KeyConditionExpression=Key("DateAction").eq(date_input+"-CIS"))
           
            temp = []
            
            for row in response['Items']:
                temp.append(row)
            
            while 'LastEvaluatedKey' in response:
                response = table.query(IndexName='DateAction-index',
                                    KeyConditionExpression=Key("DateAction").eq(date_input+"-CIS"),
                                    ExclusiveStartKey=response['LastEvaluatedKey'])
                for row in response['Items']:
                    temp.append(row)
            
            content = temp
        except KeyError as e:
            print(e)
            content = ""
    
    logs.write(event, "AWS", 200, event['body'], "Get CIS Report", "Get report of date {date}".format(date=date_input))

    return {"statusCode":200, "body":dumps({"error":False, "dates_available":dates, "content": content}),
    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}


def get_status_sqs(event):
    client = boto3.client("sqs")

    response = client.get_queue_attributes(
        QueueUrl=environ['URL_SQS_CIS'],
        AttributeNames=['ApproximateNumberOfMessages','ApproximateNumberOfMessagesNotVisible']
    )
    
    format_data = {
        "total_processing": response['Attributes']['ApproximateNumberOfMessages'],
        "total_available": response['Attributes']['ApproximateNumberOfMessagesNotVisible'],
    }

    return {"statusCode":200, "body":dumps({"error":False, "data": format_data}),
    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}


def publish_sns_data_compliance(event):
    date_action = str(datetime.datetime.utcnow().isoformat())

    insert_date("CIS",date_action)

    lam = boto3.client("lambda")
    resp = lam.invoke(
        FunctionName=environ["LAMBDA_ORGANIZATION"],
        InvocationType="RequestResponse",
        LogType="Tail"
    )

    accounts = loads( loads(resp['Payload'].read().decode())['body'] )
    sqs_client = boto3.client("sqs")
    
    for account in accounts['accounts']:
        sqs_client.send_message(
            QueueUrl=environ['URL_SQS_CIS'],
            MessageBody=dumps({
                "account_id": account['Id'], 
                "account_name":account['Name'], 
                "date_action": date_action
                })
        )

    logs.write(event, "AWS", 200, event['body'], "New CIS Report", "")

    return {"statusCode":200, "body":dumps({"error":False, "message":"Checking..."}),
    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}


def lambda_handler(event, context):
    if event['httpMethod'] == "GET":
        if event['resource'] == "/aws/policiescompliance/cis/dates-available":
            username = event.get('requestContext').get('authorizer').get('username')
            if not UserACL(username).has_acl("aws","get-report-cis-compliance"):
                return {"statusCode":403, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}            
            return get_dates_available(event)
    
        
        elif event['resource'] == "/aws/policiescompliance/cis/check":
            username = event.get('requestContext').get('authorizer').get('username')
            if not UserACL(username).has_acl("aws","get-report-cis-compliance"):
                return {"statusCode":403, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}            
            return get_compliance(event)
        
        
        elif event['resource'] == "/aws/policiescompliance/cis/status":
            username = event.get('requestContext').get('authorizer').get('username')
            if not UserACL(username).has_acl("aws","status-cis-compliance"):
                return {"statusCode":403, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}            
            return get_status_sqs(event)

    
    elif event['httpMethod'] == "POST" and event['resource'] == "/aws/policiescompliance/cis":
        username = event.get('requestContext').get('authorizer').get('username')
        if not UserACL(username).has_acl("aws","create-cis-compliance"):
            return {"statusCode":403, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}        
        return publish_sns_data_compliance(event)
    

    return {"statusCode":404, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
        
