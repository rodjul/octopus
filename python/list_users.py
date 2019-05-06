import boto3
import octopus

def list_resources(
    iam_client,
    resource,
    resource_action,
    **kwargs):

    page = 1
    func = getattr(iam_client,resource_action)
    resource_list = func(**kwargs)
    print('Page 1: %s' % resource_list)
    resources = resource_list[resource]
    print(resources)
    if resource_list['IsTruncated']:
        print('More than one page to display data. Paginating...')
    while resource_list['IsTruncated']:
        kwargs['Marker']=resource_list['Marker']
        page += 1
        resource_list = func(**kwargs)
        print('Page %s: %s' % (page,resource_list))
        resources.extend(resource_list[resource])

    return resources

def lambda_handler(event, context):
    accounts=event['accounts']
    for account in accounts
        print(account)
        # Assumes linked account role with IAM service
        print('Setting up IAM Service...')
        try:
            iam_client = octopus.assume_role(
                account['Id'],
                'octopusmngt',
                'createrole',
                'iam',
                'us-east-1')
            print('IAM Service assumed...')
        except Exception as e:
            print('Could not assume IAM on account %s. Error: %s' % (
                account['Id'],
                str(e))
            )
            continue

        # List users on account
        account['Users'] = list_resources(
            iam_client,
            'Users',
            'list_users'
        )

        # Iterates through users listing policies
        print('Analysing users one by one...')
        for user in account['Users']:
            print(user)
            user['Policies'] = []
            try:
                inline_user_policies = list_resources(
                    iam_client,
                    'PolicyNames',
                    'list_user_policies',
                    UserName=role['UserName']
                )
            except Exception as e:
                print('Could not list inline policies for user %s: %s' % (
                    str(user['UserName']),
                    str(e))
                )
            
            for policy in inline_user_policies:
                try:
                    inline_doc = iam_client.get_user_policy(
                        UserName=role['UserName'],
                        PolicyName=policy
                    )

                    role['Policies'].extend(
                        {
                            'PolicyName':policy,
                            'PolicyDocument':inline_doc['PolicyDocument']
                        }
                    )
                except Exception as e:
                    print('Could not retrieve details for policy %s: %s' % (
                        str(policy),
                        str(e))
                    )
            
            try:
                attached_user_policies = list_resources(
                    iam_client,
                    'AttachedPolicies',
                    'list_attached_user_policies',
                    UserName=role['UserName']
                )
            except Exception as e:
                print('Could not list attached policies for user %s: %s ' % (
                    str(user['UserName']),
                    str(e))
                )     

            for i in attached_user_polices:
                try:                
                    policy_details = list_resources(
                        iam_client,
                        'Versions',
                        'list_policy_versions',
                        PolicyArn=i['PolicyArn']
                    )
                except Exception as e:
                    print('Could not list version of policies for user %s: %s' % (
                        str(user['UserName']),
                        str(e))
                    )
                try:    
                    for sub in policy_details:
                        if sub['IsDefaultVersion']:
                            document = iam_client.get_policy_version(
                                PolicyArn=i['PolicyArn'],
                                VersionId=sub['VersionId']
                            )
                            role['Policies'].append(
                                {
                                    'PolicyName':i['PolicyName'],
                                    'PolicyDocument':document['PolicyVersion']['Document'],
                                    'DocumentVersion':sub['VersionId']
                                }
                            )
                except Exception as e:
                    print('Could not get document policy for user %s: %s' % (
                        str(user['UserName']),
                        str(e))
                    )
            
            try:
                user['AccessKeys'] = list_resources(
                    iam_client,
                    'AccessKeyMetadata',
                    'list_access_keys',
                    UserName=user['UserName']
                )
            except Exception as e:
                print('Could not list access_keys for user %s: %s' % (
                    user['UserName'],
                    str(e))
                )

            try:
                user['Groups'] = list_resources(
                    iam_client,
                    'Groups',
                    'list_groups_for_user',
                    Username=user['UserName']

                )
            except Exception as e:
                print('Could not list groups for user %s: %s' % (
                    user['UserName'],
                    str(e))
                )
    print(accounts)