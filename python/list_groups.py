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

        # List Groups on account
        account['Groups'] = list_resources(
            iam_client,
            'Groups',
            'list_groups'
        )
        
        # Iterates through groups listing policies
        print('Analysing groups one by one...')
        for group in account['Groups']:
            print(group)
            group['Policies'] = []
            try:
                inline_group_policies = list_resources(
                    iam_client,
                    'PolicyNames',
                    'list_group_policies',
                    GroupName=role['GroupName']
                )
            except Exception as e:
                print('Could not list inline policies for group %s: %s' % (
                    str(group['GroupName']),
                    str(e))
                )
            
            for policy in inline_group_policies:
                try:
                    inline_doc = iam_client.get_group_policy(
                        GroupName=role['GroupName'],
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
                attached_group_polices = list_resources(
                    iam_client,
                    'AttachedPolicies',
                    'list_attached_group_policies',
                    GroupName=role['GroupName']
                )
            except Exception as e:
                print('Could not list attached policies for group %s: %s ' % (
                    str(group['GroupName']),
                    str(e))
                )

            for i in attached_group_polices:
                try:                
                    policy_details = list_resources(
                        iam_client,
                        'Versions',
                        'list_policy_versions',
                        PolicyArn=i['PolicyArn']
                    )
                except Exception as e:
                    print('Could not list version of policies for group %s: %s' % (
                        str(group['GroupName']),
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
                    print('Could not get document policy for group %s: %s' % (
                        str(group['GroupName']),
                        str(e))
                    )
    print(accounts)