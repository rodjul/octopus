import boto3
from json import loads, dumps
from os import environ
from datetime import datetime, timedelta
from model.providergcp import ProviderGCP



def lambda_handler(event,context):
    sqs_client = boto3.client("sqs")

    gcp = ProviderGCP()
    gcp.list_organization_projects()
    
    expiration_day_ttl = int((datetime.utcnow() + timedelta(days=3)).timestamp())

    for project in gcp.projects:
        sqs_client.send_message(
            QueueUrl=environ['URL_SQS_GCP_IAM_POLICY'],
            MessageBody=dumps({
                "project_id": project['project_id'], 
                "expiration_ttl": expiration_day_ttl
            })
        )
    
    