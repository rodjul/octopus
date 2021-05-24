import json
import boto3
from os import environ

def send_email(subject, message):
    #arn = "arn:aws:sns:us-east-2:826839167791:s3inspector"
    arn = environ['ARN_SNS_EMAIL']
    client = boto3.client('sns')
    client.publish(
        TargetArn=arn,
        Subject=subject,
        Message=message,
        MessageStructure='string'
    )


def lambda_handler(event, context):
    try:
        # subject = "Octopus Report Check (AWS)"
        # message = json.loads(event)['message']
        subject = json.loads(event)['subject']
        message = json.loads(event)['message']
    except Exception as e:
        print(e)
        subject = event['subject']
        message = event['message']
    send_email(subject, message)

    return {
        "statusCode": 200
    }

