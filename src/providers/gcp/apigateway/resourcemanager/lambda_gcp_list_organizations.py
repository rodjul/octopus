from json import dumps
from utils import logs
from model.providergcp import ProviderGCP
from model.useracl import UserACL

def lambda_handler(event, context):
    username = event.get('requestContext').get('authorizer').get('username')
    if not UserACL(username).has_acl("gcp","list-organization-resource-manager"):
        return {"statusCode":403, "body":"","headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    
    try:
        gcp = ProviderGCP()
        _ = gcp.list_organization_folders()
        _ = gcp.list_organization_projects()
        _ = gcp.list_organization()
    except Exception as e:
        message = str(e)
        return {"statusCode":400, "body":dumps({"error":True, "message":"An error occurred at the endpoint. Message: "+message}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

    output = gcp.get_formatted_organization_list()

    logs.write(event, "GCP", 200, "", "List Resource Manager", "" )

    return {"statusCode":200, "body":dumps({"error":False, "data": output}),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
