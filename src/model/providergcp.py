from googleapiclient import discovery
from google.oauth2 import service_account
from google.cloud import resource_manager
import json
import traceback
import random
import boto3
import botocore


class ProviderGCP:
    def __init__(self):
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table("octopus_gcp_account_api")
        resp = table.get_item(Key={"JsonMetadata": "gcp"})
        data = {}
        if "Item" in resp:
            data = resp['Item']['GcpMetadata']
        
        # service_account_info = json.load(open('service_account.json'))
        service_account_info = data
        self.credentials = service_account.Credentials.from_service_account_info(service_account_info)
        self.projects = []
        self.folders = []
        self.organizations = []


    def get_parent_folder_name(self, folder_id):
        '''
        Search a folder to get their string name
        Reference:
        - https://cloud.google.com/resource-manager/reference/rest/v2/folders/search
        '''
        #credentials = GoogleCredentials.get_application_default()
        # credentials = service_account.Credentials.from_service_account_file("resource-name-13380464a63c.json")

        service = discovery.build('cloudresourcemanager', 'v2', credentials=self.credentials, cache_discovery=False)

        request = service.folders()
        response = request.search(body={"query":"name=folders/{folder_id}".format(folder_id=folder_id)}).execute()
        '''
        {'folders': [{'name': 'folders/0123654987654', 'parent': 'folders/0123456789', 'displayName': 'InfoSec', 'lifecycleState': 'ACTIVE', 'createTime': '2020-06-11T13:52:32.360Z'}]}
        '''
        # print(response)
        return response['folders'][0]['displayName']


    def get_folder_info(self, folder_id):
        '''
        Search a folder to get their string name
        Reference:
        - https://cloud.google.com/resource-manager/reference/rest/v2/folders/search
        '''
        #credentials = GoogleCredentials.get_application_default()
        # credentials = service_account.Credentials.from_service_account_file("resource-name-13380464a63c.json")

        service = discovery.build('cloudresourcemanager', 'v2', credentials=self.credentials, cache_discovery=False)
        
        if not folder_id.startswith("folders/"):
            folder_id = "folders/"+str(folder_id)

        request = service.folders()
        response = request.list(parent=folder_id).execute()
        '''
        {'folders': [{'name': 'folders/0123654987654', 'parent': 'folders/0123456789', 'displayName': 'InfoSec', 'lifecycleState': 'ACTIVE', 'createTime': '2020-06-11T13:52:32.360Z'}]}
        '''
        # print(response)
        return response


    def get_projects_by_folder(self, folder_id):
        '''
        Search a folder to get their string name
        Reference:
        - https://cloud.google.com/resource-manager/reference/rest/v2/folders/search
        '''
        #credentials = GoogleCredentials.get_application_default()
        # credentials = service_account.Credentials.from_service_account_file("resource-name-13380464a63c.json")

        service = discovery.build('cloudresourcemanager', 'v1', credentials=self.credentials, cache_discovery=False)

        if folder_id.startswith("folders/") or folder_id.startswith("organizations/"):
            folder_id = folder_id.split("/")[1]
        else:
            raise Exception("Invalid folder_id")
        response = service.projects().list(filter="parent.id={folder_id}".format(folder_id=folder_id)).execute()
        '''
        {'folders': [{'name': 'folders/0123654987654', 'parent': 'folders/0123456789', 'displayName': 'InfoSec', 'lifecycleState': 'ACTIVE', 'createTime': '2020-06-11T13:52:32.360Z'}]}
        '''
        # print(response)
        return response
    
    
    def list_organization(self):
        '''
        Obtain which organizations this service account is allowed to work with
        Reference:
        - https://cloud.google.com/resource-manager/reference/rest/v1/organizations/search
        '''
        service = discovery.build('cloudresourcemanager', 'v1', credentials=self.credentials, cache_discovery=False)
        request = service.organizations().search()
        try:
            response = request.execute()
        except Exception as e:
            print(traceback.format_exc(e))
            print(e)
            return []

        self.organizations = response['organizations']
        return response


    def list_organization_folders(self):
        '''
        Get all folders at Resource Manager
        Reference:
        - https://cloud.google.com/resource-manager/reference/rest/v2/folders/search
        '''
        # credentials = service_account.Credentials.from_service_account_file("resource-name-13380464a63c.json")

        service = discovery.build('cloudresourcemanager', 'v2', credentials=self.credentials, cache_discovery=False)

        request = service.folders()
        response = request.search().execute()
        '''
        {'folders': [{'name': 'folders/0123654987654', 'parent': 'folders/0123456789', 'displayName': 'InfoSec', 'lifecycleState': 'ACTIVE', 'createTime': '2020-06-11T13:52:32.360Z'}]}
        '''
        self.folders = response['folders']
        return self.folders

    
    def list_organization_projects(self):
        '''
        Get all projects at Resource Manager
        Reference:
        - https://cloud.google.com/resource-manager/reference/rest/v2/folders/search
        '''
        # credentials = service_account.Credentials.from_service_account_file("resource-name-13380464a63c.json")
        client = resource_manager.Client(self.credentials)
        
        response =  [p for p in client.list_projects()]

        for proj in response:
            temp = vars(proj)
            del temp['_client']
            self.projects.append(temp)
        
        return self.projects

    
    def _recursive_find_childs_folder(self, parent_folder):
        '''
        Recursively find folders and projects given a parent folder
        '''
        childs = []

        temp = self.folders
        for folder in temp:
            if folder['parent'].startswith(parent_folder):
                folder['childs'] = self._recursive_find_childs_folder(folder['name'])
                childs.append(folder)
                
        temp2 = self.projects
        for project in temp2:
            if ("folders/"+project['parent']['id']) == parent_folder:
                childs.append(project)
        
        return childs
                

    def get_formatted_organization_list(self):
        '''
        Outputs a formatted JSON of Resource Manage at Organizations
        returns: 
        [
            {
                "name": "folders/987654321",
                "parent": "organizations/0000123456789",
                "displayName": "NAME123",
                "lifecycleState": "ACTIVE",
                "createTime": "2019-10-15T13:55:45.293Z",
                "childs": [...]
            },
            {
                "project_id": "login-oauth-1234",
                "name": "Login Oauth",
                "number": "456987321",
                "labels": {},
                "status": "ACTIVE",
                "parent": {
                    "type": "organization",
                    "id": "0000123456789"
                }
            }
        ]
        '''
        if not len(self.folders) or not len(self.projects) or not len(self.organizations):
            print("Error: Folders, projects and organizations need to have some data")
            return []

        output = []
        # find folders at root organizations
        for folder in self.folders:
            if folder['parent'].startswith("organizations/"):
                output.append(folder)

        for folder_organization in output:
            childs = []

            folders = self.folders
            for folder in folders:
                # find child of folders
                if folder['parent'].startswith(folder_organization['name']):
                    folder['childs'] = self._recursive_find_childs_folder(folder['name'])
                    childs.append(folder)

            # find projects in this folder
            projects = self.projects
            for project in projects:
                if ("folders/"+project['parent']['id']) == folder_organization['name']:
                    childs.append(project)

            folder_organization['childs'] = childs

        # adding projects alone
        for project in self.projects:
            if project['parent']['type'] == "organization":
                output.append(project)

        # organizing by organization
        organization_output = []
        for organization in self.organizations:
            childs = []
            for row in output:
                if row['parent'] == organization['name'] or (row['parent']['type']+"s/"+row['parent']['id']) == organization['name']  :
                    childs.append(row)
            
            organization['childs'] = childs
            organization_output.append(organization)
            
        # print(json.dumps(output, indent=2 ))
        return organization_output


    def create_folder(self, parent_folder, folder_name) -> bool:
        '''
        parent_folder: "folders/{folder_id}" or "organizations/{org_id}"
        Reference: 
        - https://cloud.google.com/resource-manager/reference/rest/v2/folders/create
        - http://googleapis.github.io/google-api-python-client/docs/dyn/cloudresourcemanager_v2.folders.html
        - https://stackoverflow.com/questions/59460623/how-to-create-a-folder-a-project-under-it-with-deployment-manager-google-clou
        '''
        # credentials = service_account.Credentials.from_service_account_file("resource-name-13380464a63c.json")

        service = discovery.build('cloudresourcemanager', 'v2', credentials=self.credentials, cache_discovery=False)
        request = service.folders().create(parent=parent_folder, body={"displayName":folder_name})
        try:
            response = request.execute()
            if not "name" in response:
                return False
        except Exception as e:
            print(traceback.format_exc(e))
            return False

        return True

    
    def create_project(self, parent, project_name) -> bool:
        '''
        parent_folder: {"id":0123456789, "type": "folder / organization"}
        Reference: 
        - https://cloud.google.com/resource-manager/reference/rest/v1/projects/create
        - http://googleapis.github.io/google-api-python-client/docs/dyn/cloudresourcemanager_v1.projects.html#create
        '''
        # credentials = service_account.Credentials.from_service_account_file("resource-name-13380464a63c.json")

        service = discovery.build('cloudresourcemanager', 'v1', credentials=self.credentials, cache_discovery=False)
        data = {
            "projectId": project_name.lower().replace(" ","-") +"-"+ "".join(random.choices(['0','1','2','3','4','5','6','7','8','9'],k=4)),
            "name": project_name,
            "parent": parent,
        }
        request = service.projects().create(body=data)
        try:
            response = request.execute()
            if not "name" in response:
                return False
        except Exception as e:
            print(traceback.format_exc(e))
            return False

        return True

    
    def get_iam_policy_organizations(self):
        '''
        Get IAM roles, policies and users in the organization ID
        Reference:
        - https://cloud.google.com/resource-manager/reference/rest/v1/organizations/getIamPolicy
        '''
        service = discovery.build('cloudresourcemanager', 'v1', credentials=self.credentials, cache_discovery=False)
        request = service.organizations().getIamPolicy(resource="organizations/808425972825")
        try:
            response = request.execute()
        except Exception as e:
            print(traceback.format_exc(e))
            print(e)
            return {}
        
        return response
    
    
    def get_iam_policy_projects(self, resource_id):
        '''
        Get IAM roles, policies and users in the resource ID
        Reference:
        - https://cloud.google.com/resource-manager/reference/rest/v1/projects/getIamPolicy
        '''
        service = discovery.build('cloudresourcemanager', 'v1', credentials=self.credentials, cache_discovery=False)
        # request = service.projects().listOrgPolicies(resource="projects/{resource_id}".format(resource_id=resource_id))
        request = service.projects().getIamPolicy(resource="{resource_id}".format(resource_id=resource_id))
        try:
            response = request.execute()
        except Exception as e:
            print(traceback.format_exc(e))
            print(e)
            return {}
        
        return response
    

    def _seach_user(self):
        '''
        Reference:
        - https://developers.google.com/people/api/rest/v1/people/get?hl=en_US
        - http://googleapis.github.io/google-api-python-client/docs/dyn/people_v1.people.html

        Read:
        - https://developers.google.com/admin-sdk/directory/v1/guides/delegation
        - https://stackoverflow.com/questions/64112645/service-account-must-be-a-g-suite-domain-user
        - https://www.nylas.com/blog/google-people-api-vs-contacts-api-migration
        - https://support.google.com/a/answer/6343701?hl=en

        - https://medium.com/@emilefugulin/building-a-google-contacts-integration-with-search-in-2020-f9fffb9315a8
        ERROR:
        googleapiclient.errors.HttpError: <HttpError 400 when requesting https://people.googleapis.com/v1/people:listDirectoryPeople?readMask=emailAddresses%2Cnames&sources=DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE&alt=json returned "Must be a G Suite domain user.">
        https://stackoverflow.com/questions/41840383/does-google-people-api-support-ability-to-query

        '''
        # service = discovery.build('people', 'v1', credentials=credentials, cache_discovery=False)
        # people.listDirectoryPeople(readMask="emailAddresses,names", sources="DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE").execute() 
        return "NOT_IMPLEMENTED"
    

    # def update_user_iam_policy_projects(self, resource_id, role_id, user):
    #     service = discovery.build('cloudresourcemanager', 'v1', credentials=self.credentials, cache_discovery=False)

    #     iam_policy = self.get_iam_policy_projects(resource_id)
        
    #     if not role_id.startswith("roles/"):
    #         role_id = "roles/"+role_id

    #     found_policy = False
    #     for row in iam_policy['binding']:
    #         if row['role'] == role_id:
    #             found_policy = True
    #             found = False
    #             for member in row['members']:
    #                 if member == user:
    #                     found = True
    #                     break
                
    #             if not found:
    #                 row['members'].append(user)
        
    #     if not found_policy:
    #         iam_policy['bindings'].append({
    #             "role": role_id,
    #             "members": [
    #                 user
    #             ]
    #         })

    #     policy_document = {
    #         "policy": iam_policy
    #     }
        
    #     request = service.projects().setIamPolicy(resource="resource-name",body=policy_document)
    #     try:
    #         response = request.execute()
    #     except Exception as e:
    #         print(traceback.format_exc(e))
    #         print(e)
    #         raise e
    
    
    def add_users_iam_policy_projects(self, resource_id, role_id, users):
        '''
        Given an array of users and iam role, it will update or create role with users
        Reference:
        - https://cloud.google.com/resource-manager/reference/rest/v1/projects/setIamPolicy
        '''
        service = discovery.build('cloudresourcemanager', 'v1', credentials=self.credentials, cache_discovery=False)

        iam_policy = self.get_iam_policy_projects(resource_id)
        
        if not role_id.startswith("roles/"):
            role_id = "roles/"+role_id

        found_policy = False
        for row in iam_policy['bindings']:
            if row['role'] == role_id:
                found_policy = True
                found = False
                for user in users:
                    for member in row['members']:
                        if member == user:
                            found = True
                            break
                    if not found:
                        if not user.startswith("user:"):
                            user = "user:"+user
                        row['members'].append(user)
        
        if not found_policy:
            iam_policy['bindings'].append({
                "role": role_id,
                "members": users
            })

        policy_document = {
            "policy": iam_policy
        }
        
        # request = service.projects().setIamPolicy(resource="resource-name",body=policy_document)
        try:
            request = service.projects().setIamPolicy(resource=resource_id,body=policy_document)
            response = request.execute()
            if not response:
                return False, "Error"
        except Exception as e:
            print(traceback.format_exc(e))
            print(e)
            return False, e
        
        return True, "ok"

    



# gcp = ProviderGCP()
# gcp.list_organization_folders()
# gcp.list_organization_projects()
# gcp.list_organization()
# gcp.add_iam_policy_in_projects()
# print(len(gcp.projects))

# output = gcp.get_formatted_organization_list()
# print(json.dumps(output, indent=2))

# print(ProviderGCP().get_parent_folder_name("808425972825"))
