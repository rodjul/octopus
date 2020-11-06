import boto3


def lambda_handler(event, context):
    return {"statusCode":200, "body":"ok",
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}