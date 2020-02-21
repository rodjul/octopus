import boto3
import botocore
from model.iam_control import IamControl
from os import environ
from json import loads, dumps
import hashlib
import datetime 
from boto3.dynamodb.conditions import Attr


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
    table = dynamodb.Table("octopus_account_compliance")
    date_actions = table.scan(FilterExpression=Attr("TypeCompliance").eq("CIS"))
    dates =  list( set( [date['DateAction'].split("-")[0] for date in date_actions['Items']] ) )
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
            # content = table.scan(FilterExpression=Attr("DateAction").eq(date_input)
            content = table.scan(FilterExpression=Attr("TypeCompliance").eq("CIS"))['Items']
            temp = []
            for row in content:
                if row['DateAction'].split("-")[0] == date_input:
                    temp.append(row)
            content = row
        except KeyError as e:
            print(e)
            content = ""
    
    return {"statusCode":200, "body":dumps({"error":False, "dates_available":dates, "content": content}),
    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}


def lambda_handler(event, context):
    print("Debug:",event)
           
    if event['httpMethod'] == "GET":
        if event['resource'] == "/policy/compliance/cis/dates-available":
            dates = dates = get_date_actions()
            return {"statusCode":200, "body":dumps({"error":False, "dates_available":dates}),
    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    
        elif event['resource'] == "/policy/compliance/cis/check":
            return get_compliance(event)
        
