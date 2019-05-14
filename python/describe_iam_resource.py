import boto3
from os import environ
from octopus import list_resources,assume_role

def lambda_handler(event, context):

    # Variables
    resource = event["resource"]#"Roles"
    resource_name_tag = event["resource_name_tag"]#"RoleName"
    action_list_resource = event["action_list_resource"]#"list_roles"
    action_list_resource_policies = event["action_list_resource_policies"]#"list_role_policies"
    action_get_resource_policy = event["action_get_resource_policy"]#"get_role_policy"
    action_list_attached_policies = event["action_list_attached_policies"]#"list_attached_role_policies"
    token_name = event["token_name"]#"Marker"
    session_name = event["session_name"]
    accounts = event["accounts"]

    for account in accounts:
        print(account)
        # Assumes linked account role with IAM service
        print("Setting up IAM Service...")
        try:
            iam_client = assume_role(
                account["Id"],
                "octopusmngt",
                session_name,
                "iam",
                "us-east-1")
            print("IAM Service assumed...")
        except Exception as e:
            print("Could not assume IAM on account %s. Error: %s" % (
                str(account["Id"]),
                str(e))
            )
            continue

        # List Selected Resource on account
        resource_list = list_resources(
            iam_client,
            resource,
            action_list_resource,
            token_name
        )

        # Parameters to create structure on DynamoDB table
        update_parameters = {
            "SET Services = if_not_exists(Services, :v)":{"M":{}},
            "SET Services.IAM = if_not_exists(Services.IAM, :v)":{"M":{}},
            "SET Services.IAM.{}_list = :v".format(resource):{"L":[]}
        }

        dynamodb_client = boto3.client("dynamodb")

        # Loop to create structure on table where resources will be saved
        for expression,values in update_parameters.items():
            response = dynamodb_client.update_item(
                TableName=environ["accounts_table"],
                Key={
                    "Id": {
                        "S": account["Id"]
                    }
                },
                ReturnValues="ALL_NEW",
                ReturnConsumedCapacity="TOTAL",
                ReturnItemCollectionMetrics="SIZE",
                UpdateExpression=expression,
                ExpressionAttributeValues={":v":values}
            )
            print(response)

        # Iterates through resource listing policies
        print("Analysing %s one by one..." % resource)
        for item in resource_list:
            print(item)
            item["Policies"] = []
            try:
                # Dict with parameters to list resource's inline policies
                parameters = {
                    resource_name_tag:item[resource_name_tag]
                }

                inline_policies = list_resources(
                    iam_client,
                    "PolicyNames",
                    action_list_resource_policies,
                    token_name,
                    **parameters
                )
            except Exception as e:
                print("Could not list inline policies for %s %s: %s" % (
                    str(resource_name_tag),
                    str(item[resource_name_tag]),
                    str(e))
                )

            for policy in inline_policies:
                try:
                    # Creates dict with parameters used to get policy
                    parameters = {
                        resource_name_tag:item[resource_name_tag],
                        "PolicyName":policy
                    }

                    inline_doc = list_resources(
                        iam_client,
                        "PolicyDocument",
                        action_get_resource_policy,
                        token_name,
                        **parameters
                    )

                    item["Policies"].extend(
                        {
                            "PolicyName":policy,
                            "PolicyDocument":inline_doc
                        }
                    )
                except Exception as e:
                    print("Could not retrieve details for policy %s: %s" % (
                        str(policy),
                        str(e))
                    )

            try:
                # Dict with parameters to list resource"s attached policies
                parameters = {
                    resource_name_tag:item[resource_name_tag]
                }

                attached_polices = list_resources(
                    iam_client,
                    "AttachedPolicies",
                    action_list_attached_policies,
                    token_name,
                    **parameters
                )
            except Exception as e:
                print("Could not list attached policies for %s %s: %s " % (
                    str(resource_name_tag),
                    str(item[resource_name_tag]),
                    str(e))
                )

            for i in attached_polices:
                try:
                    # Creates dict with parameters used to get policy versions
                    policy_details = list_resources(
                        iam_client,
                        "Versions",
                        "list_policy_versions",
                        token_name,
                        PolicyArn=i["PolicyArn"]
                    )
                except Exception as e:
                    print('Could not list versions of policy for %s %s: %s' % (
                        str(resource_name_tag),
                        str(item[resource_name_tag]),
                        str(e))
                    )
                try:    
                    # Select default policy and save the data about it
                    for sub in policy_details:
                        if sub["IsDefaultVersion"]:
                            document = iam_client.get_policy_version(
                                PolicyArn=i["PolicyArn"],
                                VersionId=sub["VersionId"]
                            )
                            item["Policies"].append(
                                {
                                    "PolicyName":i["PolicyName"],
                                    "PolicyDocument":document["PolicyVersion"]["Document"],
                                    "DocumentVersion":sub["VersionId"]
                                }
                            )
                except Exception as e:
                    print("Could not get document policy for %s %s: %s" % (
                        str(resource_name_tag),
                        str(item[resource_name_tag]),
                        str(e))
                    )
        print("List of {} extracted: {}".format(resource,resource_list))
