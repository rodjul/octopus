import boto3
import json
from utils import logs
from model.useracl import UserACL


def update_metadata_api(data_json):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_gcp_account_api")

    item = {
        "JsonMetadata": "gcp",
        "GcpMetadata": data_json 
    }
    table.put_item( Item=item )


def lambda_handler(event, context):
    username = event.get('requestContext').get('authorizer').get('username')
    if not UserACL(username).has_acl("gcp","update-account-api"):
        return {"statusCode":403, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
        
    # print(event)
    try:
        body = json.loads(event['body'])
        metadata = json.loads(body['metadata'])
    except KeyError:
        return {"statusCode":400, "body":json.dumps({"error":True, "message":"Invalid parameters"}),
            "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    except Exception:
        return {"statusCode":400, "body":json.dumps({"error":True, "message":"Invalid parameters"}),
            "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

    update_metadata_api(metadata)

    logs.write(event, "GCP", 200, "", "Update GCP API Metadata", "The json metadata of GCP API was updated" )

    return {"statusCode":200, "body":json.dumps({"error":False, "message":"ok"}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    


