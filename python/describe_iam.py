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
    if 'IsTruncated' in resource_list and resource_list['IsTruncated']:
        print('More than one page to display data. Paginating...')
        while resource_list['IsTruncated']:
            kwargs['Marker']=resource_list['Marker']
            page += 1
            resource_list = func(**kwargs)
            print('Page %s: %s' % (page,resource_list))
            resources.extend(resource_list[resource])

    return resources

def lambda_handler(event, context):

    # Variables
    resource = event['resource']#'Roles'
    resource_name_tag = event['resource_name_tag']#'RoleName'
    action_list_resource = event['action_list_resource']#'list_roles'
    action_list_resource_policies = event['action_list_resource_policies']#'list_role_policies'
    action_get_resource_policy = event['action_get_resource_policy']#'get_role_policy'
    action_list_attached_policies = event['action_list_attached_policies']#'list_attached_role_policies'
    session_name = event['session_name']
    accounts = event['accounts']

    for account in accounts:
        print(account)
        # Assumes linked account role with IAM service
        print('Setting up IAM Service...')
        try:
            iam_client = octopus.assume_role(
                account['Id'],
                'octopusmngt',
                session_name,
                'iam',
                'us-east-1')
            print('IAM Service assumed...')
        except Exception as e:
            print('Could not assume IAM on account %s. Error: %s' % (
                str(account['Id']),
                str(e))
            )
            continue

        # List Selected Resource on account
        account[resource] = list_resources(
            iam_client,
            resource,
            action_list_resource
        )

        # Iterates through resource listing policies
        print('Analysing %s one by one...' % resource)
        for item in account[resource]:
            print(item)
            item['Policies'] = []
            try:
                inline_policies = list_resources(
                    iam_client,
                    'PolicyNames',
                    action_list_resource_policies,
                    resource_name_tag=item[resource_name_tag]
                )
            except Exception as e:
                print('Could not list inline policies for %s %s: %s' % (
                    str(resource_name_tag),
                    str(item[resource_name_tag]),
                    str(e))
                )

            for policy in inline_policies:
                try:
                    inline_doc = list_resources(
                        iam_client,
                        'PolicyDocument',
                        action_get_resource_policy,
                        resource_name_tag=item[resource_name_tag],
                        PolicyName=policy
                    )

                    item['Policies'].extend(
                        {
                            'PolicyName':policy,
                            'PolicyDocument':inline_doc
                        }
                    )
                except Exception as e:
                    print('Could not retrieve details for policy %s: %s' % (
                        str(policy),
                        str(e))
                    )

            try:
                attached_polices = list_resources(
                    iam_client,
                    'AttachedPolicies',
                    action_list_attached_policies,
                    resource_name_tag=item[resource_name_tag]
                )
            except Exception as e:
                print('Could not list attached policies for %s %s: %s ' % (
                    str(resource_name_tag),
                    str(item[resource_name_tag]),
                    str(e))
                )

            for i in attached_polices:
                try:                
                    policy_details = list_resources(
                        iam_client,
                        'Versions',
                        'list_policy_versions',
                        PolicyArn=i['PolicyArn']
                    )
                except Exception as e:
                    print('Could not list versions of policy for %s %s: %s' % (
                        str(resource_name_tag),
                        str(item[resource_name_tag]),
                        str(e))
                    )
                try:    
                    for sub in policy_details:
                        if sub['IsDefaultVersion']:
                            document = iam_client.get_policy_version(
                                PolicyArn=i['PolicyArn'],
                                VersionId=sub['VersionId']
                            )
                            item['Policies'].append(
                                {
                                    'PolicyName':i['PolicyName'],
                                    'PolicyDocument':document['PolicyVersion']['Document'],
                                    'DocumentVersion':sub['VersionId']
                                }
                            )
                except Exception as e:
                    print('Could not get document policy for %s %s: %s' % (
                        str(resource_name_tag),
                        str(item[resource_name_tag]),
                        str(e))
                    )
    print(accounts)