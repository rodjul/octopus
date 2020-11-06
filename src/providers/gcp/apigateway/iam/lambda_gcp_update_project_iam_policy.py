from json import dumps, loads
import boto3
from datetime import datetime
from urllib.parse import unquote
from model.providergcp import ProviderGCP
from utils import logs
from model.useracl import UserACL

def register_update(project_id, iam_role_id, users, motive):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_gcp_history_changes_resource_manager")

    # expiration_day_ttl = int((datetime.utcnow() + timedelta(days=3)).timestamp())
    item = {
        "Timestamp": datetime.utcnow().isoformat(),
        "Type":"UPDATE_IAM_PROJECT",
        "ProjectId": project_id,
        "RoleGiven": iam_role_id,
        "Users": users,
        "Motive": motive
    }

    table.put_item( Item=item )


def lambda_handler(event, context):
    username = event.get('requestContext').get('authorizer').get('username')
    if not UserACL(username).has_acl("gcp","update-iam-policy-project"):
        return {"statusCode":403, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    
    try:
        project_id = unquote( event["pathParameters"]['resourceName'] )
        body = loads(event['body'])
        iam_role_id = body['role_id']
        users = body['users']
        motive = body['motive']
        
        if len(project_id.split())>1 or project_id.startswith("folders/") or project_id.startswith("organizations/") or \
            not project_id or not type(users) == list or not len(users) or motive:

            return {"statusCode":400, "body":dumps({"error":True, "message":"Invalid parameters"}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
        
    except KeyError:
        return {"statusCode":400, "body":dumps({"error":True, "message":"Invalid parameters"}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

    gcp = ProviderGCP()

    status, message = gcp.add_users_iam_policy_projects(project_id, iam_role_id, users)
    if not status:
        return {"statusCode":400, "body":dumps({"error":True, "message": "Ocurred an error with the parameters specified", "error":message}),
            "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    
    register_update(project_id, iam_role_id, users, motive)

    logs.write(event, "GCP", 200, event['body'], "Update IAM Policy Project", "" )

    return {"statusCode":200, "body":dumps({"error":False, "message": "success"}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
