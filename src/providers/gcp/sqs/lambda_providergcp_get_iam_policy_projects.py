import boto3
import botocore
from json import loads, dumps
from boto3.dynamodb.conditions import Attr, Key
from model.providergcp import ProviderGCP
import time
import traceback


def insert_gcp_iam_policy(project_id, expiration_ttl, iam_policy):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_gcp_iam_policy")

    item = {
        "project_id": project_id,
        "iam_policy": iam_policy,
        "expiration_ttl": str(expiration_ttl)
    }

    try:
        time.sleep(0.5)
        table.put_item( Item=item )
    except botocore.exceptions.ClientError as e:
        if e.response['Error']['Code'] == 'ProvisionedThroughputExceededException':
            time.sleep(2)
            table.put_item( Item=item )
        else:
            raise e



def lambda_handler(event, context):
    if "Records" in event:
        gcp = ProviderGCP()

        for msg in event['Records']:
            project_id = loads(msg['body'])['project_id']
            expiration_ttl = loads(msg['body'])['expiration_ttl']

            try:
                time.sleep(1)
                iam_policy = gcp.get_iam_policy_projects(project_id)
            except Exception as e:
                print(traceback.format_exc(e))
                print(e)
                iam_policy = "ERROR"

            insert_gcp_iam_policy(project_id, expiration_ttl, iam_policy)


            
            