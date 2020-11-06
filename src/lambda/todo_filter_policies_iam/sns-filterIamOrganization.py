import json
import boto3
import botocore
import re


def get_creds(aws_service,**kwargs):
    if "Id" not in kwargs:
        return boto3.client(aws_service)
    else:
        try:
            sts = boto3.client("sts")
        except botocore.exceptions.ClientError as e:
            raise e

        if "role" in kwargs:
            role = kwargs["role"]
        else:
            role = "octopusmngt"

        if "session_name" in kwargs:
            session_name = kwargs["session_name"]
        else:
            session_name = "octopusroleassumed"
        
        try:
            role = sts.assume_role(
                RoleArn="arn:aws:iam::{}:role/{}".format(kwargs["Id"],role),
                RoleSessionName=session_name
            )
        except botocore.exceptions.ClientError as e:
            raise e

        if "region" in kwargs:
            region = kwargs["region"]
        else:
            region = "us-east-2"       

        try:    
            client = boto3.client(
                aws_service,
                region_name=region,
                aws_access_key_id=role['Credentials']['AccessKeyId'],
                aws_secret_access_key=role['Credentials']['SecretAccessKey'],
                aws_session_token=role['Credentials']['SessionToken']
            )
            return client
        except botocore.exceptions.ClientError as e:
            raise e


def is_policy_billing_attached(iam, policies):
    readonly_iam = "arn:aws:iam::aws:policy/AWSBillingReadOnlyAccess"
    billing_iam = "arn:aws:iam::aws:policy/job-function/Billing"
    output = []
    for policy in policies:
        if policy['PolicyArn'] == readonly_iam:
            output.append(policy['PolicyName'])
        elif policy['PolicyArn'] == billing_iam:
            output.append(policy['PolicyName'])
        
        elif re.match("arn:aws:iam::[0-9]+:policy/", policy['PolicyArn']):
            version_id = iam.get_policy(PolicyArn=policy['PolicyArn'])['Policy']['DefaultVersionId']
            policy_version = iam.get_policy_version(PolicyArn=policy['PolicyArn'], VersionId=version_id)
            statements = filter_statement_json(policy_version['PolicyVersion']['Document']['Statement'])
            if statements:
                output.append({"Policy":policy['PolicyArn'], "Actions":statements})
            
    return output


def filter_statement_json(policy_json):
    match = "(cur\:|budgets\:|aws-portal\:|ce\:|pricing\:|purchase-orders\:)"
    
    permissions = []
    if not type(policy_json) == list:
        policy_json = [policy_json]
        
    for statetement in policy_json:
        if statetement['Effect'].lower() == "allow":
            for action in statetement['Action']:
                # print(action)
                if re.match(match, action):
                    permissions.append(action)
    return permissions
    

def is_permissions_billing_in_inline_policy(iam_client, username, policies):
    output = []
    for policy in policies:
        try:
            response = iam_client.get_user_policy(
                    UserName=username,
                    PolicyName=policy
                )
        except Exception:
            continue
        
        statements = filter_statement_json(response['PolicyDocument']['Statement'])
        if statements:
            output.append({"Policy":policy, "Actions": statements})
    
    return output

def is_permissions_billing_in_inline_policy_role(iam_client, role_name, policies):
    output = []
    for policy in policies:
        try:
            response = iam_client.get_role_policy(
                    RoleName=role_name,
                    PolicyName=policy
                )
        except Exception:
            continue
        
        statements = filter_statement_json(response['PolicyDocument']['Statement'])
        if statements:
            output.append({"Policy":policy, "Actions": statements})
    
    return output

def is_permissions_billing_in_inline_policy_group(iam_client, group_name, policies):
    output = []
    for policy in policies:
        try:
            response = iam_client.get_group_policy(
                    RoleName=group_name,
                    PolicyName=policy
                )
        except Exception:
            continue
        
        statements = filter_statement_json(response['PolicyDocument']['Statement'])
        if statements:
            output.append({"Policy":policy, "Actions": statements})
    
    return output
    


def lambda_handler(event, context):
    # print(event)
    
    for account in event['Records']:
        account_id = json.loads(account['body'])['account_id']
        email  = json.loads(account['body'])['email']
        
        print(account_id)
        try:
            iam = get_creds("iam", Id=account_id)
            response = iam.list_users(MaxItems=1000)
        except Exception as e:
            print(e)
            continue
        users = []
        for user in response['Users']:
            policies_attached = iam.list_attached_user_policies(UserName=user['UserName'],MaxItems=1000)['AttachedPolicies']
            has_policies_attached = is_policy_billing_attached(iam, policies_attached)
            user_policies = iam.list_user_policies(UserName=user['UserName'], MaxItems=1000)['PolicyNames']
            filter_billing_policies = is_permissions_billing_in_inline_policy(iam, user['UserName'], user_policies)
            # is_permissions_billing_in_inline_policy(iam, user['UserName'], ["asd"])
            
            if has_policies_attached or filter_billing_policies:
                users.append({"UserName":user['UserName'], "Policies":filter_billing_policies, "PolicyBillingAttached": has_policies_attached})
        # print(users)
        # output.append(users)
        
        response = iam.list_roles(MaxItems=1000)
        roles = []
        for role in response['Roles']:
            role_name = role['RoleName']
            role_inline_policies_name = iam.list_role_policies(RoleName=role_name,MaxItems=1000)['PolicyNames']
            filter_billing_policies = is_permissions_billing_in_inline_policy_role(iam, role_name, role_inline_policies_name)
            
            # role_inline = []
            # for inline in role_inline_policies_name:
            #     response = iam.get_role_policy(RoleName=role_name,PolicyName=inline)
            #     statements = filter_statement_json(response['PolicyDocument']['Statement'])
            #     if statements:
            #         role_inline.append({"Policy":inline, "Actions": statements})
    
            attached_role_policies = iam.list_attached_role_policies(RoleName=role_name,MaxItems=1000)['AttachedPolicies']
            # print(role_name, attached_role_policies)
            has_policies_attached = is_policy_billing_attached(iam, attached_role_policies)
            
            if has_policies_attached or filter_billing_policies:
                roles.append({"RoleName":role_name, "Roles":filter_billing_policies, "PolicyBillingAttached": has_policies_attached})
        
        response = iam.list_groups(MaxItems=1000)
        groups = []
        for group in response['Groups']:
            group_name = group['GroupName']
            group_inline_policies_name = iam.list_group_policies(GroupName=group_name,MaxItems=1000)['PolicyNames']
            filter_billing_policies = is_permissions_billing_in_inline_policy_group(iam, group_name, group_inline_policies_name)
    
            attached_group_policies = iam.list_attached_group_policies(GroupName=group_name,MaxItems=1000)['AttachedPolicies']
            has_policies_attached = is_policy_billing_attached(iam, attached_group_policies)
            
            if has_policies_attached or filter_billing_policies:
                groups.append({"GroupName":group_name, "Roles":filter_billing_policies, "PolicyBillingAttached": has_policies_attached})
        
        
        data_to_save = {
            "account":{"id":account_id, "email":email},
            "Groups": groups,
            "Users": users,
            "Roles": roles,
        }
        # print(data_to_save)
        s3 = boto3.resource('s3')
        filename = "billing_policy_"+str(account_id)+".json.txt"
        object = s3.Object('teste-rodjul', "reports/"+filename)
        # object = s3.Object('teste-rodjul', filename)
        object.put(Body=bytes(json.dumps(data_to_save, indent=4), encoding='utf8')) 
        
    