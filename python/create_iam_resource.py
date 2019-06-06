from octopus import get_creds
from octopus import list_resources
from octopus import my_aws_methods
from octopus import my_logging
from octopus import sort_multilevel_obj
from octopus import query_items
from json import loads,dumps
from os import environ

# ============================================================================#
#           PYTHONIC WAY TO CREATE A CONSTANT. USED AS DEFAULT KWARGS         #
# ============================================================================#
def my_kwargs():
    return {
        "{}Name".format(resource_key):resource_name
    }

# ============================================================================#
#                   CREATES OR UPDATES ROLES, GROUPS AND USERS                #
# ============================================================================#
def create_iam_resource(**resource):
    # Get information about resource when created
    get_resource = my_aws_methods(
        iam_client,
        "get_{}".format(resource_key.lower()),
       **my_kwargs()
    )
 
    # Verifies if resource was retrivied or did not exist
    if get_resource == "NoSuchEntity":
        
        # If the resource is a Role
        # adds more parameters to kwargs
        if resource_key == "Role":
            role_params = my_kwargs()
            role_params["AssumeRolePolicyDocument"] = str(resource["AssumeRolePolicy"]["S"])
            role_params["Description"] = resource["Description"]["S"]
            if "MaxSession" in resource:
                role_params["MaxSessionDuration"] = int(resource["MaxSession"]["N"])
                my_logging("role_params updated: {}".format(role_params))    

        # Creates resource
        create_resource = my_aws_methods(
            iam_client,
            "create_{}".format(resource_key.lower()),
            **role_params
        )
        return my_logging({
            "status":"new",
            "resource":create_resource
        })
    else:

        # If resource is a role
        # and description is incorrect, updates it
        if "Description" in resource and \
        get_resource["Role"]["Description"] != resource["Description"]["S"]:
            description = iam_client.update_role(
                RoleName=resource_name,
                Description=resource["Description"]["S"]
            )
            my_logging("Description updated: {}".format(description))
            get_resource["Role"]["Description"] = resource["Description"]["S"]

        # If resource is a role,
        # and max session duration is incorrect, updates it
        if "MaxSession" in resource and \
        get_resource["Role"]["MaxSessionDuration"] != resource["MaxSession"]["N"]:
            max_session = iam_client.update_role(
                RoleName=resource_name,
                MaxSessionDuration=int(resource["MaxSession"]["N"])
            )
            my_logging("Session Duration updated: {}".format(max_session))
            get_resource["Role"]["MaxSessionDuration"] = resource["MaxSession"]["N"]

        # If resource is a role,
        # updates assume-role-policy-document when necessary
        if "AssumeRolePolicy" in resource and \
        sort_multilevel_obj(get_resource["Role"]["AssumeRolePolicyDocument"]) != sort_multilevel_obj(loads(resource["AssumeRolePolicy"]["S"])):
                update_assume_role = iam_client.update_assume_role_policy(
                    RoleName=resource_name,
                    PolicyDocument=str(resource["AssumeRolePolicy"]["S"])
                )
                my_logging("Assume Policy updated: {}".format(
                    update_assume_role))
                    
                get_resource["Role"]["AssumeRolePolicyDocument"] = resource["AssumeRolePolicy"]["S"]

        message = {
            "status":"existent",
            "resource":get_resource
        }
        my_logging(message)
        return message

# ============================================================================#
#                            LIST INLINE POLICIES                             #
# ============================================================================#
def get_inline_policies(**kwargs):
    # List inline policies
    inline_policies = list_resources(
        iam_client,
        "PolicyNames",
        "list_{}_policies".format(resource_key.lower()),
        "Marker",
        **kwargs
    )
    my_logging("InlinePolicies: {}".format(inline_policies))
    
    return inline_policies

# ============================================================================#
#                           LIST ATTACHED POLICIES                            #
# ============================================================================#
def get_attached_policies(**kwargs):
    # List attached policies
    attached_policies = list_resources(
        iam_client,
        "AttachedPolicies",
        "list_attached_{}_policies".format(resource_key.lower()),
        "Marker",
        **kwargs
    )
    my_logging("AttachedPolicies: {}".format(attached_policies))

    return attached_policies

# ============================================================================#
#                          UPDATES EXISTENT POLICY                            #
# ============================================================================#
def update_policy_ver(policy,policy_data,versions):

    for ver in versions:
        # Find the version in use (default)
        # and compares it with the template
        # If it is different, updates it
        if ver["IsDefaultVersion"]:

            # Get policy default version details
            ver_detail = iam_client.get_policy_version(
                PolicyArn=policy["Arn"],
                VersionId=ver["VersionId"]
            )["PolicyVersion"]

            # Sets documents in variables to comparison
            # (It could done be directly on if statement but
            # this way is easier to read)
            ver_doc = sort_multilevel_obj(ver_detail["Document"])
            my_logging("Document Version: {}".format(ver_doc))
            templ_doc = sort_multilevel_obj(loads(policy_data["Document"]["S"]))
            my_logging("Document Template: {}".format(templ_doc))
            
            # Compares current policy with the one should exist
            # If different, updates it
            if ver_doc != templ_doc:
            
                # If there are 5 versions already
                # deletes de oldest one
                if len(versions) >= 5:
                    ver_id = "v1" # default version to delete
                    from datetime import datetime
                    from datetime import timezone
                    
                    comp_date = datetime.now(timezone.utc) # comparison date
                    # Finds the oldest version
                    for v in versions:
                        if v["CreateDate"] < comp_date:
                            comp_date = v["CreateDate"]
                            ver_id = v["VersionId"]

                    # Deletes the oldest version        
                    iam_client.delete_policy_version(
                        PolicyArn=policy["Arn"],
                        VersionId=str(ver_id)
                    )
                
                # Updates policy with new version
                # Sets new version as default
                new_version = iam_client.create_policy_version(
                    PolicyArn=policy["Arn"],
                    PolicyDocument=str(policy_data["Document"]["S"]),
                    SetAsDefault=True
                )
                my_logging(
                    "Policy {} Updated: {}".format(
                        policy["PolicyName"],
                        new_version
                    )
                )
    return True

# ============================================================================#
#                    APPLY POLICIES AS SHOULD BE ON RESOURCE                  #
# ============================================================================#
def apply_policies(**resource):

    kwargs = my_kwargs()

    # List inline policies
    inline_policies = get_inline_policies(**kwargs)

    # List attached policies
    attached_policies = get_attached_policies(**kwargs)

    # List managed policies maintained by customer on account
    managed_policies = list_resources(
        iam_client,
        "Policies",
        "list_policies",
        "Marker",
        Scope="Local"
    )
    my_logging("ManagedPolicies: {}".format(managed_policies))
    # Get the list of managed policy names on account
    managed_policy_names = []
    for i in managed_policies:
        managed_policy_names.append(i["PolicyName"])
    my_logging("ManagedPoliciesNames: {}".format(managed_policy_names))

    # Get the names of the inline policies that shoud exist on resource
    templ_inline_policy_names = []
    for i in resource["InlinePolicies"]["L"]:
        templ_inline_policy_names.append(i["M"]["Name"]["S"])
    my_logging(
        "TemplateInlineNames: {}".format(
            templ_inline_policy_names
        )
    )

    # Get the names of the managed policies that shoud be attached on resource
    templ_attach_policy_names = []
    for i in resource["ManagedPolicies"]["L"]:
        templ_attach_policy_names.append(i["S"])
    my_logging(
        "TemplateAttachedNames: {}".format(
            templ_attach_policy_names
        )
    )


    ### Compares inline policies with the ones should exist ###

    # if inline policy should not exist, deletes it
    for item in inline_policies:
        if item.lower() not in map(str.lower,templ_inline_policy_names):
            delete_params = my_kwargs()
            delete_params["PolicyName"] = item
            delete_inline = my_aws_methods(
                iam_client,
                "delete_{}_policy".format(resource_key.lower()),
                **delete_params
            )
            my_logging("Delete Inline Policy: {}".format(delete_inline))

    # if inline policy does not exists, creates it
    for item in resource["InlinePolicies"]["L"]:
        if item["M"]["Name"]["S"].lower() not in map(str.lower,inline_policies):
            create_params = my_kwargs()
            create_params["PolicyName"] = item["M"]["Name"]["S"]
            create_params["PolicyDocument"] = item["M"]["Document"]["S"]
            create_inline = my_aws_methods(
                iam_client,
                "put_{}_policy".format(resource_key.lower()),
                **create_params
            )
            my_logging("Create Inline Policy: {}".format(create_inline))

        # Verifies if inline policy exists but is outdated and updates it
        else:
            get_params = my_kwargs()
            get_params["PolicyName"] = item["M"]["Name"]["S"]
            get_inline = my_aws_methods(
                iam_client,
                "get_{}_policy".format(resource_key.lower()),
                **get_params
            )
            my_logging(
                "InlinePolicy {} Details: {}".format(
                    item["M"]["Name"]["S"],
                    get_inline
                )
            )
            # current_policy = get_inline["PolicyDocument"]
            current_policy = sort_multilevel_obj(get_inline["PolicyDocument"])
            my_logging("Current Policy: {}".format(current_policy))

            template = sort_multilevel_obj(loads(item["M"]["Document"]["S"]))
            my_logging("Template Policy: {}".format(template))

            # Compares policies: Current vs Template
            # If they are different, updates with template version
            if current_policy != template:
                update_params = my_kwargs()
                update_params["PolicyName"] = item["M"]["Name"]["S"]
                update_params["PolicyDocument"] = item["M"]["Document"]["S"]
                update_inline = my_aws_methods(
                    iam_client,
                    "put_{}_policy".format(resource_key.lower()),
                    **update_params
                )
                my_logging(
                    "Update Inline Policy {}: {}".format(
                        item["M"]["Name"]["S"],
                        update_inline
                    )
                )

    ### Compares managed policies with the ones should exist ###

    # if managed policy should not exist, deletes it
    for item in attached_policies:
        if item["PolicyName"].lower() not in map(str.lower,templ_attach_policy_names):
            detach_params = my_kwargs()
            detach_params["PolicyArn"] = item["PolicyArn"]
            detach_policy = my_aws_methods(
                iam_client,
                "detach_{}_policy".format(resource_key.lower()),
                **detach_params
            )
            my_logging(
                "Dettach Policy {}: {}".format(
                    item["PolicyName"],
                    detach_policy
                )
            )

    for item in templ_attach_policy_names:
        # Retrieves data about the policy on dynamodb
        policy_data = dynamodb_client.get_item(
            TableName= environ["iam_managed_policies_table"],
            Key={
                "PolicyName": {
                    "S": item
                }
            },
            ReturnConsumedCapacity="TOTAL",
            ConsistentRead=True
        )
        policy_data = policy_data["Item"]
        my_logging(
            "Details about the Policy {}: {}".format(
                item,
                policy_data
            )
        )
        # Verifies whether is an AWS managed or Local managed policy
        # If has a Document attached on Dynamo,
        # Than it is Local (Maintained by customer)
        if "Document" in policy_data:
            my_logging(
                "{} is a Customer Managed Policy".format(
                    policy_data["PolicyName"]["S"]
                )
            )

            # if managed policy does not exists, creates it
            if item.lower() not in map(str.lower,managed_policy_names):
                my_logging(
                    "Policy {} does not exist on account yet".format(
                        policy_data["PolicyName"]["S"]
                    )
                )
                policy = iam_client.create_policy(
                    PolicyName=policy_data["PolicyName"]["S"],
                    PolicyDocument=policy_data["Document"]["S"],
                    Description=policy_data["Description"]["S"]
                )["Policy"]
                my_logging(
                    "Policy {} Created on account: {}".format(
                        policy_data["PolicyName"]["S"],
                        policy
                    )
                )
                
                # Adds Arn of new policy to PolicyData to be Attached
                policy_data["Arn"] = {"S": policy["Arn"]}

            # Verifies if managed policy exists but is outdated
            else:
                for i in managed_policies:
                    if i["PolicyName"].lower() == item.lower():

                        # Adds Arn of existent policy to PolicyData
                        # To be Attached later
                        policy_data["Arn"] = {"S": i["Arn"]}

                        # List Policy Versions
                        versions = list_resources(
                            iam_client,
                            "Versions",
                            "list_policy_versions",
                            "Marker",
                            PolicyArn=i["Arn"]
                        )
                        my_logging(
                            "Versions for policy {}: {}".format(
                                i["PolicyName"],
                                versions
                            )
                        )

                        # Verifies if policy needs to be updated
                        update_policy_ver(i,policy_data,versions)

        # Verifies if managed policy (AWS or local) is attached to resource
        already_attached = False
        for i in attached_policies:
            if i["PolicyArn"] == policy_data["Arn"]:
                already_attached = True

        # If Policy is not attached yet, attaches it
        if already_attached == False:
            attach_params = my_kwargs()
            attach_params["PolicyArn"] = policy_data["Arn"]["S"]

            attach_to_resource = my_aws_methods(
                iam_client,
                "attach_{}_policy".format(resource_key.lower()),
                **attach_params
            )
            my_logging(
                "Policy {} Attached: {}".format(
                    item,
                    attach_to_resource
                )
            )
        else:
            my_logging("Policy {} already attached".format(i["PolicyName"]))
    
    # Get inline and attached policies on resource again to return final state
    final_policies = []
    # List inline policies
    final_inline = get_inline_policies(**my_kwargs())
    final_policies.append({"inline":final_inline})

    # List attached policies
    final_attached = get_attached_policies(**my_kwargs())
    final_policies.append({"attached":final_attached})

    return "Policies Enforced Successfully: {}".format(final_policies)
                    

# ============================================================================#
#                               MAIN FUNCTION                                 #
# ============================================================================#
def lambda_handler(event,context):
    my_event = {
        "Id":"826839167791",
        "IamResourceType":"Role",
        "IamResourceName":"teste"
    }

    # Declares global variables used by other functions
    global resource_key
    resource_key = my_event["IamResourceType"]

    global resource_name
    resource_name = my_event["IamResourceName"]

    global iam_client
    iam_client = get_creds(
        "iam",
        Id=my_event["Id"]
    )

    global dynamodb_client
    dynamodb_client = get_creds("dynamodb")


    # Get data about desired IAM Resource
    item = dynamodb_client.get_item(
        TableName= environ["iam_resource_table"],
        Key={
                "ResourceName": {
                    "S": resource_name
                },
                "ResourceType":{
                    "S":resource_key
                }
        },
        ReturnConsumedCapacity="TOTAL",
        ConsistentRead=True
    )
    my_logging(
        "Details about {} {}: {}".format(
            resource_key,
            resource_name,
            item
        )
    )

    # Enforces resource creation on account
    resource = create_iam_resource(**item["Item"])
    my_logging("Enforce Resource: {}".format(resource))

    policies = apply_policies(**item["Item"])
    my_logging("Enforce Policies: {}".format(policies))