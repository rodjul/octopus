import boto3
from os import environ
from octopus import list_resources
from octopus import my_logging
from octopus import get_creds
from octopus import is_full_access
from octopus import send_sqs
from octopus import send_sns
from octopus import handle_event_trigger
from json import loads,dumps
from ast import literal_eval

# ============================================================================#
#          SETS VARIABLES ACCORDING TO RESOURCE TYPE IN INPUT MESSAGE         #
# ============================================================================#
def vars_by_resource(resource):
    if resource == "Roles":
        key_name = "RoleName"
        list_action = "list_roles"
        list_policy = "list_role_policies"
        get_policy = "get_role_policy"
        list_attached = "list_attached_role_policies"
        token = "Marker"

    elif resource == "Groups":
        key_name = "GroupName"
        list_action = "list_groups"
        list_policy = "list_group_policies"
        get_policy = "get_group_policy"
        list_attached = "list_attached_group_policies"
        token = "Marker"
    
    elif resource == "Users":
        key_name = "UserName"
        list_action = "list_users"
        list_policy = "list_user_policies"
        get_policy = "get_user_policy"
        list_attached = "list_attached_user_policies"
        token = "Marker"
    
    return key_name, list_action, list_policy, get_policy, list_attached, token

# ============================================================================#
#                  DESCRIBES DESIRED IAM RESOURCES ON ACCOUNT                 #
# ============================================================================#
def describe_iam_resource(client,resource_type,action,token):
    my_logging("Describing {}".format(resource_type))
    # Returns a List of Dicts with "Path", "UserName", "UserId", "Arn", "CreateDate",
    # "PermissionsBoundary", "Tags",
    # "PasswordLasUsed", 
    # "AssumeRolePolicyDocument", "Description", "MaxSessionDuration"
    try:
        resources = list_resources(client,resource_type,action,token)
        my_logging("{} retrieved: {}".format(resource_type,resources))
        return resources
    except botocore.exceptions.ClientError as e:
        my_logging("Could not list {}: {}".format(resource_type,e),"error")
        return e

# ============================================================================#
#              DESCRIBES INLINE OR ATTACHED POLICIES ON RESOURCE              #
# ============================================================================#
def get_policies_on_resource(client,resource,action,token,key_name):
    my_logging("Describing {} policies for {}".format(policy_type,resource))
    # When "inline", returns a List of Strings (policy names)
    # When "attached" returns a List of Dicts with "PolicyName" and "PolicyArn"
        
    try:
        kwargs = {key_name:resource}
        item="AttachedPolicies" if "attached" in action else item="PolicyNames"
        policies = list_resources(client,item,action,token,**kwargs)
        my_logging("Policies for {}: {}".format(resource,policies))
        return policies
    except botocore.exceptions.ClientError as e:
        my_logging("Could not list {}: {}".format(resource,e),"error")
        return e

# ============================================================================#
#                    DESCRIBES MANAGED POLICIES ON ACCOUNT                    #
# ============================================================================#
def get_managed_policies(client):
    my_logging("Describing managed policies")
    # Returns a List of Dicts with "PolicyName", "PolicyId", "Arn", "Path",
    # "DefaultVersionId", "AttachmentCount", "PermissionsBoundaryUsageCount",
    # "IsAttachable", "Description", "CreateDate", "UpdateDate"
    try:
        policies = list_resources(client,"Policies","list_policies","Marker")
        my_logging("Managed Policies: {}".format(policies))
        return policies
    except botocore.exceptions.ClientError as e:
        my_logging("Could not list Managed Policies: {}".format(e),"error")
        return e

# ============================================================================#
#        RETRIEVES INLINE AND MANAGED POLICIES DEFINED FOR THE RESOURCE       #
# ============================================================================#


# ============================================================================#
#                       RETRIEVES INLINE POLICY DOCUMENT                      #
# ============================================================================#


# ============================================================================#
#                      RETRIEVES MANAGED POLICY DOCUMENT                      #
# ============================================================================#


# ============================================================================#
#          VERIFIES RESOURCE DOES NOT HAVE INLINE POLICIES UNDEFINED          #
# ============================================================================#



# ============================================================================#
#         VERIFIES RESOURCE DOES NOT HAVE ATTACHED POLICIES UNDEFINED         #
# ============================================================================#



# ============================================================================#
#              VERIFIES RESOURCE HAS ALL INLINE POLICIES DEFINED              #
# ============================================================================#


# ============================================================================#
#        VERIFIES MANAGED POLICIES RESOURCE SHOULD HAVE ATTACHED EXISTS       #
# ============================================================================#


# ============================================================================#
#             VERIFIES RESOURCE HAS ALL ATTACHED POLICIES DEFINED             #
# ============================================================================#


# ============================================================================#
#                      CREATES INLINE POLICIES AS DEFINED                     #
# ============================================================================#


# ============================================================================#
#                     CREATES MANAGED POLICIES AS DEFINED                     #
# ============================================================================#


# ============================================================================#
#              ATTACHES MANAGED POLICIES TO RESOURCE AS DEFINED               #
# ============================================================================#


# ============================================================================#
#                 COMPARES INLINE POLICY WITH DEFINED VERSION                 #
# ============================================================================#


# ============================================================================#
#                   UPDATES INLINE POLICY AS DEFINED VERSION                  #
# ============================================================================#


# ============================================================================#
#            COMPARES MANAGED POLICY VERSION WITH DEFINED VERSION             #
# ============================================================================#


# ============================================================================#
#           VALIDATES THAT EXISTS LESS THEN FIVE(5) POLICY VERSIONS           #
# ============================================================================#


# ============================================================================#
#                  UPDATES MANAGED POLICY AS DEFINED VERSION                  #
# ============================================================================#


# ============================================================================#
#  #
# ============================================================================#


# ============================================================================#
#  #
# ============================================================================#


# ============================================================================#
#  #
# ============================================================================#


# ============================================================================#
#  #
# ============================================================================#


# ============================================================================#
#  #
# ============================================================================#

client = get_creds("iam",Id=acc_id)


# ============================================================================#
#                       RECORDS ITEMS ON DYNAMODB TABLE                       #
# ============================================================================#
def update_item(Id,expression,values):
    try:
        client = get_creds("dynamodb")

        response = client.update_item(
            TableName=environ["accounts_table"],
            Key={"Id":{"S": Id}},
            ReturnValues="ALL_NEW",
            ReturnConsumedCapacity="TOTAL",
            ReturnItemCollectionMetrics="SIZE",
            UpdateExpression=expression,
            ExpressionAttributeValues={":v":values}
        )
        my_logging("Items recorded: {}".format(response))
        return response
    except botocore.exceptions.ClientError as e:
        my_logging("Could not record items: {}".format(e),"error")
        return e

# ============================================================================#
#            CREATES A BASIC TABLE STRUCTURE FOR THE IAM RESOURCES            #
# ============================================================================#
def create_dynamo_structure_iam(resource,Id):
    my_logging("Recording IAM Structure on table for account {}".format(Id))
    try:
        # Parameters to create structure on DynamoDB table
        update_parameters = {
            "SET Services = if_not_exists(Services, :v)":{"M":{}},
            "SET Services.IAM = if_not_exists(Services.IAM, :v)":{"M":{}},
            "SET Services.IAM.{}_list = :v".format(resource):{"L":[]}
        }
        my_logging("Parameters: {}".format(update_parameters))
    except Exception as e:
        my_logging("Error on setting update_parameters: {}".format(e))

    # Loop to create structure on table where resources will be saved
    for expression,values in update_parameters.items():
        update = update_item(
            Id,
            expression,
            values
        )
        my_logging(update)

# ============================================================================#
#                                MAIN FUNCTION                                #
# ============================================================================#
def main_function(event):

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

# ============================================================================#
#                             GETS INITIAL INPUT                              #
# ============================================================================#
def lambda_handler(event,context):
    handle_event_trigger(event)