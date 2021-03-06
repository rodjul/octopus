import boto3
import botocore
from model.iam_control import IamControl
from os import environ
from json import loads, dumps
import hashlib
import datetime 
from boto3.dynamodb.conditions import Key,Attr


# def insert_data(account_id, account_name, data_json, date_action):
#     '''
#     Insert the name account create to make the index
#     '''
#     dynamodb = boto3.resource('dynamodb')
#     table = dynamodb.Table("octopus_account_compliance")

#     item = {
#         "DateAction": date_action,
#         "Account": account_id,
#         "Name": account_name,
#         "DataCompliance": dumps(data_json, ensure_ascii=False),
#         "TypeCompliance":"CIS"
#         }

#     table.put_item( Item=item )


def get_date_actions():
    # obter todos as datas e dps retornar no json as datas disponiveis
    # obter da data mais recente quando na 1 vez
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_account_compliance_dates")
    response = table.scan(FilterExpression=Attr("DateAction").contains("CIS"))
    dates = []
    
    for item in response['Items']:
        dates.append(item['DateAction'].split("-")[0])

    while 'LastEvaluatedKey' in response:
        response = table.scan(FilterExpression=Attr("DateAction").contains("CIS"),
                            ExclusiveStartKey=response['LastEvaluatedKey'])
        for item in response['Items']:
            dates.append(item['DateAction'].split("-")[0])

    dates = list(set(dates))
    dates.sort()
    return dates


def get_compliance(event):
    try:
        date_input = event['queryStringParameters']['date_action']
    except KeyError as e:
        print("Error in get param: ",e)
        return {"statusCode":400, "body":dumps({"error":True, "message":"Params invalid"}),
    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
        
    dates = get_date_actions()
    # if the value is null, get the lastest date available
    if date_input == "":
        try:
            date_input = dates[len(dates)-1]
        except IndexError:
            date_input = ""
    
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_account_compliance")
    
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
    
    return {"statusCode":200, "body":dumps({"error":False, "dates_available":dates, "content": content}),
    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}


def lambda_handler(event, context):
    print("Debug:",event)
           
    if event['httpMethod'] == "GET":
        if event['resource'] == "/policy/compliance/cis/dates-available":
            dates = get_date_actions()
            return {"statusCode":200, "body":dumps({"error":False, "dates_available":dates}),
    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    
        elif event['resource'] == "/policy/compliance/cis/check":
            return get_compliance(event)
        
