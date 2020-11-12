import boto3
# from os import environ
# from datetime import date, datetime
from json import loads, dumps


class ACL:
    def __init__(self):
        self.ADMINISTRATOR = {
            "octopus": [
                "list-event-logs",
                "update-user-permission",
                "list-users",
                "list-usergroups",
                "update-user",
            ],
            "aws":[
                "create-account",
                "create-account-status",
                "create-cis-compliance",
                "status-cis-compliance",
                "get-report-cis-compliance",
                "status-network-report",
                "create-iam-compliance",
                "get-report-iam-compliance",
                "create-network-report",
                "get-network-report",
                "create-iam-policies",
                "update-iam-policies",
                "delete-iam-policies",
                "list-iam-policies",
                "get-iam-policies",
                "update-role-type",
                "delete-role-type",
                "get-role-type",
                "list-role-type",
            ],
            "gcp":[
                "update-account-api",
                "update-iam-policy-project",
                "list-iam-policy-project",
                "create-folder-resource-manager",
                "create-project-resource-manager",
                "list-organization-resource-manager",
            ]
        }
        
        self.READER = {
            "octopus": [
                "list-event-logs",
                "list-users",
                "list-usergroups",
            ],            
            "aws":[
                "get-report-cis-compliance",
                "get-report-iam-compliance",
                "get-network-report",
                "list-iam-policies",
                "list-role-type",
            ],
            "gcp":[
                "list-iam-policy-project",
                "list-organization-resource-manager",
            ]
            
        }

class UserACL:
    def __init__(self, username):
        self.username = username
        self.group = ""
    
        usergroup = self._get_user_group()
        if usergroup:
            self.group = usergroup
    
    def _get_user_group(self):
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table("octopus_users")
    
        resp = table.get_item(Key={"Username":self.username})
        if "Item" in resp and resp['Item']:
            return resp['Item']['UserGroup']
    
    def has_acl(self, resource, permission):
        if not self.username or not self.group:
            print("Missing username or group values")
            return False
    
        try:
            has_group = getattr(ACL(), self.group.upper())
            acls = has_group[resource]
            for acl in acls:
                if acl == permission:
                    return True
        except AttributeError:
            print("Group does not exists: ",self.group.upper())
            return False
        except KeyError:
            print("Resource does not exists: ",self.group.upper(), "->",resource)
            return False
        
        return False

        

