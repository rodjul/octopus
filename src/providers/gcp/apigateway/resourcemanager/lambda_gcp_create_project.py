from json import dumps, loads
import boto3
from datetime import datetime
from model.providergcp import ProviderGCP
from utils import logs
from model.useracl import UserACL


def register_creation(parent, project_name, motive):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_gcp_history_changes_resource_manager")

    # expiration_day_ttl = int((datetime.utcnow() + timedelta(days=3)).timestamp())
    item = {
        "Timestamp": datetime.utcnow().isoformat(),
        "Type":"CREATE_PROJECT",
        "Parent": parent,
        "ProjectName": project_name,
        "Motive": motive
    }

    table.put_item( Item=item )



def lambda_handler(event, context):
    username = event.get('requestContext').get('authorizer').get('username')
    if not UserACL(username).has_acl("gcp","create-project-resource-manager"):
        return {"statusCode":403, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    
    try:
        body = loads(event['body'])
        parent = body['parent']
        project_name = body['project_name']
        motive = body['motive']
        
        if not parent.startswith("folders/") and not parent.startswith("organizations/") and not project_name or motive:
            return {"statusCode":400, "body":dumps({"error":True, "message":"Invalid parameters"}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
        
    except KeyError:
        return {"statusCode":400, "body":dumps({"error":True, "message":"Invalid parameters"}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

    gcp = ProviderGCP()

    # "parent": {"id":"148944393960", "type":"folder"},
    parent_format = { "type": parent.split("/")[0][:-1], "id": parent.split("/")[1] }
    response = gcp.create_project(parent_format, project_name)
    format_data = {
        "status": response
    }
    if response:
        register_creation(parent_format, project_name, motive)
        projects = gcp.get_projects_by_folder(parent)
        for project in projects['projects']:
            if project['name'] == project_name:
                format_data['project_info'] = project
                break

    logs.write(event, "GCP", 200, event['body'], "Create Project in Resource Manager", "" )

    return {"statusCode":200, "body":dumps({"error":False, "data": format_data}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
