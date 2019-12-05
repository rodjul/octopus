import boto3
from json import loads, dumps
from boto3.dynamodb.conditions import Attr


def lambda_handler(event,context):
    print("Debug:",event)

    try:
        body = event['pathParameters']
        name_account = body['name_account']
    except KeyError:
        return {"statusCode":400,"body":dumps({"error":True, "message":"params invalid"}),
            "headers":{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}}


    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_account")
    response = table.scan( FilterExpression = Attr("NameAccount").eq(name_account) )
    
    msg = ""
    if response['Items']:
        try:
            account_id = response['Items'][0]['AccountId']
            msg = "Account id number: "+account_id
        except KeyError:
            msg = "Not found"
    else:
        msg = "Account does not exists"

    return {"statusCode":200, "body":dumps({"error":False, "message":msg}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

