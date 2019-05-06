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
    for account in accounts:
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
                str(account['Id']),
                str(e))
            )
            continue

        # List Roles on account
        account['Roles'] = list_resources(
            iam_client,
            'Roles',
            'list_roles'
        )

        # Iterates through roles listing policies
        print('Analysing roles one by one...')
        for role in account['Roles']:
            print(role)
            role['Policies'] = []
            try:
                inline_role_policies = list_resources(
                    iam_client,
                    'PolicyNames',
                    'list_role_policies',
                    RoleName=role['RoleName']
                )
            except Exception as e:
                print('Could not list inline policies for role %s: %s' % (
                    str(role['RoleName']),
                    str(e))
                )

            for policy in inline_role_policies:
                try:
                    inline_doc = iam_client.get_role_policy(
                        RoleName=role['RoleName'],
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
                attached_role_polices = list_resources(
                    iam_client,
                    'AttachedPolicies',
                    'list_attached_role_policies',
                    RoleName=role['RoleName']
                )
            except Exception as e:
                print('Could not list attached policies for role %s: %s ' % (
                    str(role['RoleName']),
                    str(e))
                )

            for i in attached_role_polices:
                try:                
                    policy_details = list_resources(
                        iam_client,
                        'Versions',
                        'list_policy_versions',
                        PolicyArn=i['PolicyArn']
                    )
                except Exception as e:
                    print('Could not list version of policies for role %s: %s' % (
                        str(role['RoleName']),
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
                    print('Could not get document policy for role %s: %s' % (
                        str(role['RoleName']),
                        str(e))
                    )
    print(accounts)