import boto3
from json import loads, dumps
from boto3.dynamodb.conditions import Attr
from os import environ

sample = {"accounts": [{"Id": "350819178402", "Arn": "arn:aws:organizations::210272193452:account/o-wy7lic8hzm/350819178402", "Email": "licenseserversm2plataforma.aws@cloudtotvs.com.br", "Name": "licenseserversm2plataforma.aws", "Status": "ACTIVE", "JoinedMethod": "CREATED"}, {"Id": "240932178171", "Arn": "arn:aws:organizations::210272193452:account/o-wy7lic8hzm/240932178171", "Email": "octopus.teste-8@cloudtotvs.com.br", "Name": "octopus.teste-8", "Status": "ACTIVE", "JoinedMethod": "CREATED"}, {"Id": "069512972055", "Arn": "arn:aws:organizations::210272193452:account/o-wy7lic8hzm/069512972055", "Email": "C84A44.aws@cloudtotvs.com.br", "Name": "C84A44.aws", "Status": "ACTIVE", "JoinedMethod": "INVITED"}, {"Id": "961360804028", "Arn": "arn:aws:organizations::210272193452:account/o-wy7lic8hzm/961360804028", "Email": "service.plataformabkp.aws@cloudtotvs.com.br", "Name": "service.buckets1.aws", "Status": "ACTIVE", "JoinedMethod": "CREATED"}, {"Id": "367386392375", "Arn": "arn:aws:organizations::210272193452:account/o-wy7lic8hzm/367386392375", "Email": "service.buckets16.aws@cloudtotvs.com.br", "Name": "service.buckets16.aws", "Status": "ACTIVE", "JoinedMethod": "CREATED"}]}


def lambda_handler(event,context):
    print("Debug:",event)
    # try:
    #     body = loads(event['body'])
    #     # "name","email":json_data[1].value,"cloudformation":json_data[2].value
    #     account_id = body['account_id']
    # except KeyError:
    #     return {"statusCode":400,"body":dumps({"error":True, "message":"params invalid"}),
    #         "headers":{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}}

    sqs_client = boto3.client("sqs")
    
    for account in sample['accounts']:
    
        sqs_client.send_message(
            QueueUrl=environ['URL_SQS'],
            MessageBody=dumps({"account_id": account['Id'], "account_name":account['Name'], "date_action":"09012020"})
        )   
    
    return {"statusCode":200, "body":dumps({"error":False, "message":"Checking..."}),
    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
