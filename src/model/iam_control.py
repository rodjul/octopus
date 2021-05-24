import boto3
import json
import botocore
from os import environ
from boto3.dynamodb.conditions import Attr

if __name__ == '__main__':
    from octopus import get_creds, my_logging
else:
    from model.octopus import get_creds, my_logging

class IamControl:
    def __init__(self, account_id, do_sts=True):
        # session = boto3.Session(profile_name="temp")
        # self.iam_client = session.client("iam")
        self.account_id = account_id
        if do_sts:
            self.iam_client = get_creds("iam",Id=account_id)
        else:
            self.iam_client = get_creds("iam")

    def list_policies(self):
        return self.iam_client.list_policies()

    def list_roles(self):
        return self.iam_client.list_roles()

    def list_attached_role_policies(self,role_name):
        return self.iam_client.list_attached_role_policies(RoleName=role_name)

    def get_policy_arn(self, policy_name):
        policies = self.list_policies()
        for policy in policies['Policies']:
            if policy['PolicyName'] == policy_name:
                return policy['Arn']
        return "Not found"

    def get_policy_details(self, policy_name):
        policy_arn = self.get_policy_arn(policy_name)
        if policy_arn != "Not found":
            return self.iam_client.get_policy(PolicyArn=policy_arn)
        return "Not found"
    
    def get_policy_document(self, policy_name):
        policy_arn = self.get_policy_arn(policy_name)
        if policy_arn != "Not found":
            version = self.get_policy_version(policy_arn)
            return self.iam_client.get_policy_version(PolicyArn=policy_arn, VersionId=version)
        return "Not found"
    
    # get the version of an arn policy
    def get_policy_version(self,policy_arn):
        return self.iam_client.list_policy_versions(PolicyArn=policy_arn)['Versions'][0]['VersionId']

    def create_policy(self, policy_name, policy_document):
        try:
            #Name, Description, Path, PolicyDocument
            response = self.iam_client.create_policy(
                PolicyName=policy_name,
                PolicyDocument=json.dumps(policy_document)
            )
            print(response)
        except botocore.exceptions.ClientError as e:
            return e

    def create_role(self, role_name ,assume_role_policy_document):
        try:
            response = self.iam_client.create_role(
                RoleName=role_name,
                AssumeRolePolicyDocument=json.dumps(assume_role_policy_document)
            )
            print(response)
        except botocore.exceptions.ClientError as e:
            return e

    def update_policy(self, policy_name, policy_document):
        policy_arn = self.get_policy_arn(policy_name)
        if policy_arn != "Not found":
            return self.iam_client.create_policy_version(
                    PolicyArn=policy_arn,
                    PolicyDocument=json.dumps(policy_document),
                    SetAsDefault=True)
        return "Not found"

    def delete_policy(self, policy_name):
        policy_arn = self.get_policy_arn(policy_name)
        if policy_arn != "Not found":
            return self.iam_client.delete_policy(PolicyArn=policy_arn)
        return "Not found"
  
    def delete_role(self, role_name):
        try:
            return self.iam_client.delete_role(RoleName=role_name)
        except botocore.exceptions.ClientError as e:
            return e

    def attach_role_policy(self, role_name, policy_name):
        policy_arn = self.get_policy_arn(policy_name)
        if policy_arn != "Not found":
            return self.iam_client.attach_role_policy(PolicyArn=policy_arn, RoleName=role_name)
        return "Not found"

    def detach_role_policy(self, role_name, policy_name):
        policy_arn = self.get_policy_arn(policy_name)
        if policy_arn != "Not found":
            return self.iam_client.detach_role_policy(PolicyArn=policy_arn, RoleName=role_name)
        return "Not found"

    def get_document_of_roles(self, account_type):
        '''
        Returns a dict of IAM policies, roles and trustrelationship
        '''
        dynamodb = boto3.resource('dynamodb')

        roles_json = []
        policy_json = []
        trusts_json = []
        roles_from_type_account = []

        table = dynamodb.Table("octopus_aws_role_type")
        results = table.scan()
        for row in results['Items']:
            if row['RoleType'] == account_type:
                roles_from_type_account = row['Roles']
                break
        
        table = dynamodb.Table("octopus_aws_policy")
        policies =  table.scan()['Items']
        
        # para cada role da octopus_aws_role_type, procuramos o conteudo da role no octopus_aws_policy 
        for policy in policies:
            for roledb in roles_from_type_account:
                if policy['Type'] == "ROLE" and policy['PolicyName'] == roledb:
                    roles_json.append(policy['Data'])
        
        for policy in policies:
            if policy['Type'] == "POLICY":
                policy_json.append(policy)
            elif policy['Type'] == "TRUST":
                trusts_json.append(policy)
        
        return {"roles_json":roles_json, "policy_json":policy_json, "trusts_json":trusts_json}

    def setup_iam_account(self, type_role):
        '''
        Setup the policies, roles, and trustrelationship in the account.
        '''
        content_json = self.get_document_of_roles(type_role)
        roles_json  = content_json["roles_json"]
        policy_json = content_json["policy_json"]
        trusts_json = content_json["trusts_json"]

        # for each role, we will create the trust and policy
        for role in roles_json:
            #Policies - Name, Description, Path, PolicyDocument
            #Roles  - Name, Policies[], PolicyArnAWS[] , TrustRelationship
            #TrustRelationships - Name, AssumeRolePolicyDocument
            role = json.loads(role)
            role_name = role['Name']
            
            for trust_relationship in trusts_json:
                trust_relationship = json.loads(trust_relationship['Data'])

                # after we find the trust, we create the role
                # if the role exists or is created, and also exists policies it will create and attach to this role
                if trust_relationship['Name'] == role['TrustRelationship']:
                    # doing replace in the SAML ADFS
                    trust_relationship_assume_role = trust_relationship['AssumeRolePolicyDocument']
                    if "Federated" in trust_relationship_assume_role['AssumeRolePolicyDocument']['Statement'][0]['Principal'] \
                        and "ACCOUNT_ID" in trust_relationship_assume_role['AssumeRolePolicyDocument']['Statement'][0]['Principal']['Federated']:
                        trust_relationship_assume_role['AssumeRolePolicyDocument']['Statement'][0]['Principal']['Federated'] = \
                            trust_relationship_assume_role['AssumeRolePolicyDocument']['Statement'][0]['Principal']['Federated'].replace("ACCOUNT_ID",self.account_id)
                    
                    try:
                        self.iam_client.create_role(
                            RoleName=role_name,
                            AssumeRolePolicyDocument=json.dumps(trust_relationship_assume_role['AssumeRolePolicyDocument'])
                        )
                        print("Role created: ",role_name)
                    except botocore.exceptions.ClientError as e:
                        if e.response['Error']['Code'] == 'EntityAlreadyExists':
                            print("EntityAlreadyExists Role - ",role_name)
                    #role_arn = response['Role']['Arn'] #arn:aws:iam::1234567890:role/accessmngt
                    
                    # if there are policies associated with the role, we find and create
                    if role['Policies']:
                        for role_policy in role['Policies']:
                            for policy in policy_json:
                                policy = json.loads( policy['Data'] )

                                # creating policy
                                if policy['Name'] == role_policy:
                                    try:
                                        response = self.iam_client.create_policy(
                                            Path=policy['Path'],
                                            PolicyName=policy['Name'],
                                            PolicyDocument=json.dumps(policy['PolicyDocument'])
                                        )
                                        #print(response)
                                        self.iam_client.attach_role_policy(PolicyArn=response['Policy']['Arn'], RoleName=role_name)

                                    except botocore.exceptions.ClientError as e:
                                        if e.response['Error']['Code'] == 'EntityAlreadyExists':
                                            arn_already_created = "arn:aws:iam::"+self.account_id+":policy"+policy['Path']+policy['Name']
                                            self.iam_client.attach_role_policy(PolicyArn=arn_already_created, RoleName=role_name)
                    
                    # if there are standard policies from aws associated with the role, we create
                    policy_arn_aws = role['PolicyArnAWS'].split(",")
                    if policy_arn_aws and policy_arn_aws[0] != "":
                        for policy_arn in policy_arn_aws:
                            self.iam_client.attach_role_policy(PolicyArn=policy_arn, RoleName=role_name)


