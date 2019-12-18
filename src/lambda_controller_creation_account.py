import boto3
from json import loads, dumps
from boto3.dynamodb.conditions import Attr

def account_created(name_account,email_account):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_account")
    response = table.scan( FilterExpression = Attr("NameAccount").eq(name_account) & Attr("EmailAccount").eq(email_account) )
    
    status = False
    if response['Items']:
        #account_id = response['Items'][0]['AccountId']
        status = True
    
    return status

def lambda_handler(event,context):
    print("Debug:",event)
    try:
        body = loads(event['body'])
        # "name","email":json_data[1].value,"cloudformation":json_data[2].value
        name = body['name']
        email = body['email']
        cloudformation_file = body['cloudformation']
    except KeyError:
        return {"statusCode":400,"body":dumps({"error":True, "message":"params invalid"}),
            "headers":{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}}
    
    if not account_created(name,email):
        print("Criando conta", name,email)
        '''
        sqs_client = boto3.client("sqs")
        sqs_client.send_message(
                QueueUrl="https://sqs.us-east-2.amazonaws.com/826839167791/CreateAccount",
                MessageBody=dumps({"name": name, "email":email, "cloudformation":cloudformation_file })
            )   
        '''
        return {"statusCode":200, "body":dumps({"error":False, "message":"Creating account"}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    
    return {"statusCode":200, "body":dumps({"error":False, "message":"Already created"}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}