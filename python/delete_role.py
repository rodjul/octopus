import boto3
from os import environ
from json import dumps,loads
from octopus import assume_role

def lambda_handler(event, context):
    print('message received on function trigger: %s' % event)

    lambda_client = boto3.client('lambda')
    
    get_accounts = lambda_client.invoke(
        FunctionName='getLinkedAccounts',
        InvocationType='RequestResponse',
        LogType='Tail',
        Payload=dumps({"payer_id":event['payer_id'],"role_name":environ['role_payer']})
    )
    print(get_accounts)
    print()
    accounts = loads(get_accounts['Payload'].read().decode('utf-8'))
    print('Accounts type: %s' % type(accounts))
    print('A total of %s Accounts retrived: %s' % (len(accounts),accounts))
    print()
    
    active_accounts = 0
    suspended_accounts = 0

    for account in accounts:
        print('Account type: %s' % type(account))
        print('Account: %s' % account)
        
        if account['Status'] == 'ACTIVE':
            active_accounts += 1
            try:
                iam_client = assume_role(
                    account['Id'],
                    environ['role_name'],
                    'manageIamResources',
                    'iam',
                    'us-east-1')
            except Exception as err:
                print("Error: %s " % err)
                iam_client = None
                
                
            if iam_client != None:
                roles_list = iam_client.list_roles()
                found = 0
                print(roles_list['Roles'])
                for role in roles_list['Roles']:
                    if role['RoleName'] == 'cloudability':
                        print()
                        print()
                        print('cloudability_monitor role found in account %s -- %s -- %s' % (account['Id'],account['Email'],role['Arn']))
                        print()
                        print()
                        found += 1
                        
                        list_role_policies = iam_client.list_attached_role_policies(
                            RoleName='cloudability'
                        )
                        print(list_role_policies)
                        for policy in list_role_policies['AttachedPolicies']:
                            print(policy)
                            detach = iam_client.detach_role_policy(
                                RoleName='cloudability',
                                PolicyArn=policy['PolicyArn']
                            )
                        delete_role = iam_client.delete_role(
                            RoleName='cloudability'
                        )
                        print('cloudability_monitor role found and deleted: %s' % delete_role)
                        
                if found == 0:
                    print('cloudability_monitor role not found in list yet: %s' % roles_list['Roles'])
                    
                    
        else:
            print('Account %s - %s not Active! Current Status is %s ...' % (account['Id'],account['Email'],account['Status']))
            if  account['Status'] == 'SUSPENDED':
                suspended_accounts += 1
                
    print('Accounts Status: %s ACTIVE and %s SUSPENDED' % (active_accounts,suspended_accounts))