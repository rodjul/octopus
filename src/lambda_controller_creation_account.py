import boto3
from json import loads, dumps



def lambda_handler(event,context):
    try:
        body = loads(event['body'])
        # "name","email":json_data[1].value,"cloudformation":json_data[2].value
        name = body['name']
        email = body['email']
        cloudformation_file = body['cloudformation']
    except IndexError:
        return {"statusCode":400,"body":dumps({"error":True, "message":"params invalid"}),
            "headers":{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}}
    
    sqs_client = boto3.client("sqs")
    sqs_client.send_message(
            QueueUrl="https://sqs.us-east-2.amazonaws.com/826839167791/bucket_check_public",
            MessageBody=dumps({"name": name, "email":email, "cloudformation":cloudformation_file })
        )


    return {"statusCode":200, "body":dumps({"error":False, "message":"Creating account"}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}