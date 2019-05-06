import boto3
from os import environ
from json import dumps,loads
from octopus import assume_role

assume_role_policy_document = dumps({
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "assumecloudyn",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::432263259397:root"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "TOTVSSA1548775923529"
        }
      }
    }
  ]
})

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
                    if role['RoleName'] == 'cloudynRole':
                        print()
                        print()
                        print('cloudyn role found in account %s -- %s -- %s' % (account['Id'],account['Email'],role['Arn']))
                        print()
                        print()
                        found += 1
                if found == 0:
                    print('Cloudyn role not found in list yet: %s' % roles_list['Roles'])
                    print('Creating role in account %s...' % account['Id'])
                    new_role = iam_client.create_role(
                        RoleName='cloudynRole',
                        AssumeRolePolicyDocument=assume_role_policy_document,
                        Description='Role used by Cloudyn billing service. Responsibility of business ops team'
                    )
                    if 'Role' in new_role and new_role['ResponseMetadata']['HTTPStatusCode'] == 200:
                        print('New role created: %s' % new_role['Role']['Arn'])
                        print('Attaching readonly policy...')
                        attach_policy = iam_client.attach_role_policy(
                            RoleName='cloudynRole',
                            PolicyArn='arn:aws:iam::aws:policy/ReadOnlyAccess'
                        )
                        print(attach_policy)
                    else:
                        print('Role could not be created... %s' % new_role)
                    
        else:
            print('Account %s - %s not Active! Current Status is %s ...' % (account['Id'],account['Email'],account['Status']))
            if  account['Status'] == 'SUSPENDED':
                suspended_accounts += 1
                
    print('Accounts Status: %s ACTIVE and %s SUSPENDED' % (active_accounts,suspended_accounts))