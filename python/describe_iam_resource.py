import boto3
from os import environ
from octopus import list_resources,my_logging,get_creds,is_full_access,send_sqs,send_sns
from json import loads,dumps
from ast import literal_eval



# Records items on dynamodb table
def update_item(Id,expression,values):
    
    client = get_creds("dynamodb")

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

def create_dynamo_structure_iam(resource,Id):
    try:
        # Parameters to create structure on DynamoDB table
        update_parameters = {
            "SET Services = if_not_exists(Services, :v)":{"M":{}},
            "SET Services.IAM = if_not_exists(Services.IAM, :v)":{"M":{}},
            "SET Services.IAM.{}_list = :v".format(resource):{"L":[]}
        }
    except Exception as e:
        my_logging("Error on setting update_parameters: {}".format(e))


    # Loop to create structure on table where resources will be saved
    for expression,values in update_parameters.items():
        print(
            update_item(
                Id,
                expression,
                values
            )
        )
    return True

# Main function
def lambda_handler(event, context):
    print("Event received: {}".format(str(event)))

    for record in event["Records"]:
        # Variables
        resource = literal_eval(record["body"])["resource"]
        resource_name_tag = literal_eval(record["body"])["resource_name_tag"]
        token_name = literal_eval(record["body"])["token_name"]
        account = literal_eval(record["body"])["account"]

        my_logging("MessageId {} for account {}".format(
            record["messageId"],
            account["Id"])
        )
        # Assumes linked account role with IAM service
        my_logging("Setting up IAM Service...")
        iam_client = get_creds("iam",Id=account["Id"])

        # List Selected Resource on account
        resource_list = list_resources(
            iam_client,
            resource,
            literal_eval(record["body"])["action_list_resource"],
            token_name
        )

        create_dynamo_structure_iam(resource,account["Id"])

        # Iterates through resource listing policies
        my_logging("Analysing %s one by one..." % resource)
        for item in resource_list:
            my_logging(item)
            item["Policies"] = []
            try:
                # Dict with parameters to list resource's inline policies
                parameters = {
                    resource_name_tag:item[resource_name_tag]
                }

                inline_policies = list_resources(
                    iam_client,
                    "PolicyNames",
                    literal_eval(record["body"])["action_list_resource_policies"],
                    token_name,
                    **parameters
                )
            except Exception as e:
                my_logging("Could not list inline policies for %s %s: %s" % (
                    str(resource_name_tag),
                    str(item[resource_name_tag]),
                    str(e)),
                "error"
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
                        literal_eval(record["body"])["action_get_resource_policy"],
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
                    my_logging("Could not retrieve details for policy %s: %s" % (
                        str(policy),
                        str(e)),
                    "error"
                    )

            try:
                # Dict with parameters to list resource"s attached policies
                parameters = {
                    resource_name_tag:item[resource_name_tag]
                }

                attached_polices = list_resources(
                    iam_client,
                    "AttachedPolicies",
                    literal_eval(record["body"])["action_list_attached_policies"],
                    token_name,
                    **parameters
                )
            except Exception as e:
                my_logging("Could not list attached policies for %s %s: %s " % (
                    str(resource_name_tag),
                    str(item[resource_name_tag]),
                    str(e)),
                "error"
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
                    my_logging('Could not list versions of policy for %s %s: %s' % (
                        str(resource_name_tag),
                        str(item[resource_name_tag]),
                        str(e)),
                    "error"
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
                    my_logging("Could not get document policy for %s %s: %s" % (
                        str(resource_name_tag),
                        str(item[resource_name_tag]),
                        str(e)),
                    "error"
                    )
                
                try:
                    for policy in item["Policies"]:

                        # Finds AdministratorAccess Policy
                        if policy["PolicyName"] == "AdministratorAccess":
                            try:
                                msg = {
                                    "Alert":"Policy AdministratorAccess found attached",
                                    "Id":account["Id"],
                                    "Email":account["Email"],
                                    resource_name_tag:item[resource_name_tag],
                                    "Policy": policy
                                }
                                
                                my_logging(
                                    send_sqs(
                                        msg,
                                        environ["sqs_url_AdministratorAccess"]
                                    )
                                )
                                my_logging(
                                    send_sns(
                                        "Alert - AdministratorAccess Policy Found",
                                        msg,
                                        environ["sns_topic_administratorAccess"]
                                    )
                                )
                            except Exception as e:
                                my_logging(e,"error")

                        # Iterates through policies and finds those with full access permissions
                        for statement in policy["PolicyDocument"]["Statement"]:
                            if isinstance(statement["Action"], str):
                                is_full_access(
                                    statement["Action"],
                                    account["Id"],
                                    account["Email"],
                                    resource_name_tag,
                                    item[resource_name_tag],
                                    policy,
                                    environ["sqs_url_fullaccess"]
                                )
                            else:
                                for action in statement["Action"]:
                                    is_full_access(
                                        action,
                                        account["Id"],
                                        account["Email"],
                                        resource_name_tag,
                                        item[resource_name_tag],
                                        policy,
                                        environ["sqs_url_fullaccess"]
                                    ) 
                except Exception as e:
                    my_logging("Could not verify if policies are too permissive. %s %s: %s" % (
                        str(resource_name_tag),
                        str(item[resource_name_tag]),
                        str(e)),
                    "error"
                    )                                           

            item["CreateDate"] = str(item["CreateDate"])
            if "PasswordLastUsed" in item:
                item["PasswordLastUsed"] = str(item["PasswordLastUsed"])
            print(
                update_item(
                    account["Id"],
                    "SET Services.IAM.{}_list = list_append(Services.IAM.{}_list,:v)".format(
                        resource,
                        resource
                    ),
                    {"L":[{"S":str(item)}]}
                )
            )

        print("List of {} extracted: {}".format(
            resource,
            resource_list)
        )
    return my_logging("Execution finished")