import boto3
from os import environ
from octopus import list_resources,assume_role
from json import loads,dumps
from ast import literal_eval


# Records items on dynamodb table
def update_item(client,Id,expression,values):
    response = client.update_item(
        TableName=environ["accounts_table"],
        Key={
            "Id": {
                "S": Id
            }
        },
        ReturnValues="ALL_NEW",
        ReturnConsumedCapacity="TOTAL",
        ReturnItemCollectionMetrics="SIZE",
        UpdateExpression=expression,
        ExpressionAttributeValues={":v":values}
    )
    return response
        

# Main function
def lambda_handler(event, context):
    print("Event received: {}".format(str(event)))

    for record in event["Records"]:
        # Variables
        resource = literal_eval(record["body"])["resource"]
        resource_name_tag = literal_eval(record["body"])["resource_name_tag"]
        action_list_resource = literal_eval(record["body"])["action_list_resource"]
        action_list_resource_policies = literal_eval(record["body"])["action_list_resource_policies"]
        action_get_resource_policy = literal_eval(record["body"])["action_get_resource_policy"]
        action_list_attached_policies = literal_eval(record["body"])["action_list_attached_policies"]
        token_name = literal_eval(record["body"])["token_name"]
        session_name = literal_eval(record["body"])["session_name"]
        account = literal_eval(record["body"])["account"]

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
            print(
                update_item(
                    dynamodb_client,
                    account["Id"],
                    expression,
                    values
                )
            )

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

            print(
                update_item(
                    dynamodb_client,
                    account["Id"],
                    "SET Services.IAM.{}_list = list_append(Services.IAM.{}_list,:v)".format(
                        resource,
                        resource
                    ),
                    {"L":[{"S":str(item)}]}
                )
            )

        return print("List of {} extracted: {}".format(
            resource,
            resource_list)
        )