from json import dumps, loads
from utils import logs
from model.providergcp import ProviderGCP
from model.useracl import UserACL


def lambda_handler(event, context):
    username = event.get('requestContext').get('authorizer').get('username')
    if not UserACL(username).has_acl("gcp","create-folder-resource-manager"):
        return {"statusCode":403, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    
    try:
        body = loads(event['body'])
        parent = body['parent']
        folder_name = body['folder_name']
        
        if not parent.startswith("folders/") and not parent.startswith("organizations/"):
            return {"statusCode":400, "body":dumps({"error":True, "message":"Invalid parameters"}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
        
    except KeyError:
        return {"statusCode":400, "body":dumps({"error":True, "message":"Invalid parameters"}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

    gcp = ProviderGCP()
    response = gcp.create_folder(parent, folder_name)
    format_data = {
        "status": response
    }
    if response:
        folders = gcp.get_folder_info(parent)
        for folder in folders['folders']:
            if folder['displayName'] == folder_name:
                format_data['folder_info'] = folder
                break

    logs.write(event, "GCP", 200, event['body'], "Create Folder in Resource Manager", "" )

    return {"statusCode":200, "body":dumps({"error":False, "data": format_data}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
