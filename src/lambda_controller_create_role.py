import boto3
import json
import botocore


def create_policy():
    session = boto3.Session(profile_name="temp")
    content = ""
    with open("../roles.json") as f:
        content = f.read()
    content_json = json.loads(content)

    iam_client = session.client("iam")

    for policy in content_json['Policies']:
        #Name, Description, Path, PolicyDocument
        response = iam_client.create_policy(
            PolicyName=policy['Name'],
            PolicyDocument=json.dumps(policy['PolicyDocument'])
        )
        print(response)

def setup_iam_account(account_id):
    session = boto3.Session(profile_name="temp")
    content = ""
    with open("../roles.json") as f:
        content = f.read()
    content_json = json.loads(content)

    iam_client = session.client("iam")

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
                    trust_rel['AssumeRolePolicyDocument']['Statement'][0]['Principal']['Federated'] = trust_rel['AssumeRolePolicyDocument']['Statement'][0]['Principal']['Federated'].replace("ACCOUNT_ID",account_id)
                
                response = iam_client.create_role(
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
                                    response = iam_client.create_policy(
                                        Path=policy['Path'],
                                        PolicyName=policy['Name'],
                                        PolicyDocument=json.dumps(policy['PolicyDocument'])
                                    )
                                    print(response)
                                    iam_client.attach_role_policy(PolicyArn=response['Policy']['Arn'], RoleName=role_name)

                                except botocore.exceptions.ClientError as e:
                                    if e.response['Error']['Code'] == 'EntityAlreadyExists':
                                        arn_already_created = "arn:aws:iam::"+account_id+":policy"+policy['Path']+policy['Name']
                                        iam_client.attach_role_policy(PolicyArn=arn_already_created, RoleName=role_name)
                
                # if there are standard policies from aws associated with the role, we create
                if role['PolicyArnAWS']:
                    for policy_arn in role['PolicyArnAWS']:
                        iam_client.attach_role_policy(PolicyArn=policy_arn, RoleName=role_name)


                
        

# def lambda_handler(event, context):
#create_policy()
create_roles("914035169037")