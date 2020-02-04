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
    def __init__(self, account_id):
        # session = boto3.Session(profile_name="temp")
        # self.iam_client = session.client("iam")
        self.account_id = account_id
        self.iam_client = get_creds("iam",Id=account_id)

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

    def get_role_structure(self, role_type):
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table("octopus_role_type")

    def setup_iam_account(self, file_key):
        s3 = boto3.resource('s3')
        try:
            obj = s3.Object(environ['octopus_resource'], file_key)
            content_json = json.loads( obj.get()['Body'].read().decode('utf-8') )
        except botocore.exceptions.ClientError as e:
            my_logging("Could not create account: {}".format(e),"error")
            return e

        # for each role, we will create the trust and policy
        for role in content_json['Roles']:
            #Policies - Name, Description, Path, PolicyDocument
            #Roles  - Name, Policies[], PolicyArnAWS[] , TrustRelationship
            #TrustRelationships - Name, AssumeRolePolicyDocument
            role_name = role['Name']
            
            for trust_rel in content_json['TrustRelationships']:
                # after we find the trust, we create the role
                if trust_rel['Name'] == role['TrustRelationship']:
                    # doing replace in the SAML ADFS
                    if "Federated" in trust_rel['AssumeRolePolicyDocument']['Statement'][0]['Principal'] \
                        and "ACCOUNT_ID" in trust_rel['AssumeRolePolicyDocument']['Statement'][0]['Principal']['Federated']:
                        trust_rel['AssumeRolePolicyDocument']['Statement'][0]['Principal']['Federated'] = \
                            trust_rel['AssumeRolePolicyDocument']['Statement'][0]['Principal']['Federated'].replace("ACCOUNT_ID",self.account_id)
                    
                    response = self.iam_client.create_role(
                        RoleName=role_name,
                        AssumeRolePolicyDocument=json.dumps(trust_rel['AssumeRolePolicyDocument'])
                    )
                    #role_arn = response['Role']['Arn'] #arn:aws:iam::914035169037:role/accessmngt
                    
                    # if there are policies associated with the role, we find and create
                    if role['Policies']:
                        for role_policy in role['Policies']:
                            for policy in content_json['Policies']:
                                # creating policy
                                if policy['Name'] == role_policy:
                                    try:
                                        response = self.iam_client.create_policy(
                                            Path=policy['Path'],
                                            PolicyName=policy['Name'],
                                            PolicyDocument=json.dumps(policy['PolicyDocument'])
                                        )
                                        print(response)
                                        self.iam_client.attach_role_policy(PolicyArn=response['Policy']['Arn'], RoleName=role_name)

                                    except botocore.exceptions.ClientError as e:
                                        if e.response['Error']['Code'] == 'EntityAlreadyExists':
                                            arn_already_created = "arn:aws:iam::"+self.account_id+":policy"+policy['Path']+policy['Name']
                                            self.iam_client.attach_role_policy(PolicyArn=arn_already_created, RoleName=role_name)
                    
                    # if there are standard policies from aws associated with the role, we create
                    if role['PolicyArnAWS']:
                        for policy_arn in role['PolicyArnAWS']:
                            self.iam_client.attach_role_policy(PolicyArn=policy_arn, RoleName=role_name)


