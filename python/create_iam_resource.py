from octopus import get_creds
from octopus import list_resources
from octopus import my_aws_methods
from octopus import my_logging
from octopus import sort_multilevel_obj
from json import loads,dumps

kwargs = {
    "{}Name".format(my_event["IamResourceType"]):my_event["IamResourceName"]
}

# Verifies if resource does not exist yet and creates it

get_resource = my_aws_methods(
    iam_client,
    "get_{}".format(my_event["IamResourceType"].lower()),
    token_name,
    **kwargs)

if get_resource "mopa":
    resource_status = "Current"


# TO DO: treat it
if resource_status != "Current":
    create_params = kwargs
    if my_event["IamResourceType"] == "Role":
        create_params["AssumeRolePolicyDocument"] = str(my_event["AssumeRolePolicy"])
        create_params["Description"] = my_event["RoleDescription"]

        if "RoleMaxSession" in my_event:
            create_params["MaxSessionDuration"] = my_event["RoleMaxSession"]

    create_resource = my_aws_methods(
        iam_client,
        my_event["IamResourceType"],
        create_action,
        token_name,
        **create_params
    )

# If resource is a role, updates assume-role-policy-document when necessary
if my_event["IamResourceType"] == "Role" and \
resource_status == "Current" and \
get_resource["AssumeRolePolicyDocument"] != str(my_event["AssumeRolePolicy"]):
    response = iam_client.update_assume_role_policy(
        RoleName=my_event["IamResourceName"],
        PolicyDocument=str(my_event["AssumeRolePolicy"])
    )
    print(response)

# If resource is a role and description is incorrect, updates it
if my_event["IamResourceType"] == "Role" and \
resource_status == "Current" and \
get_resource["Description"] != my_event["RoleDescription"]:
    response = iam_client.update_role(
        RoleName=my_event["IamResourceName"],
        Description=my_event["RoleDescription"]
    )
    print(response)

# If resource is a role and max session duration is incorrect, updates it
if my_event["IamResourceType"] == "Role" and \
resource_status == "Current" and \
get_resource["MaxSessionDuration"] != my_event["RoleMaxSession"]:
    response = iam_client.update_role(
        RoleName=my_event["IamResourceName"],
        MaxSessionDuration=my_event["RoleMaxSession"]
    )
    print(response)

# Get template inline policies





# Get template managed policies






if resource_status == "Current":
    # List inline policies
    inline_policies = list_resources(
        iam_client,
        "PolicyNames",
        "list_{}_policies".format(my_event["IamResourceType"].lower()),
        "Marker",
        **kwargs
    )
    print(inline_policies)

    # List attached policies
    attached_policies = list_resources(
        iam_client,
        "AttachedPolicies",
        "list_attached_{}_policies".format(my_event["IamResourceType"].lower()),
        "Marker",
        **kwargs
    )
    print(attached_policies)

else:
    inline_policies = []
    attached_policies = []

### Compares inline policies with the ones should exist ###

# if inline policy should not exist, deletes it
for policy in inline_policies:
    if policy not in template_inline_policies:
        delete_params = kwargs
        delete_params["PolicyName"] = policy
        delete_inline = my_aws_methods(
            iam_client,
            "delete_{}_policy".format(my_event["IamResourceType"].lower()),
            **delete_params
        )
        print(delete_inline)

for policy in template_inline_policies:
    # if inline policy does not exists, creates it
    if policy["Name"] not in inline_policies:
        create_params = kwargs
        create_params["PolicyName"] = policy["Name"]
        create_params["PolicyDocument"] = policy["Document"]
        create_inline = my_aws_methods(
            iam_client,
            "put_{}_policy".format(my_event["IamResourceType"].lower()),
            **create_params
        )
        print(create_inline)

    # Verifies if inline policy exists but is outdated and updates it
    else:
        get_params = kwargs
        get_params["PolicyName"] = policy["Name"]
        get_inline = my_aws_methods(
            iam_client,
            "get_{}_policy".format(my_event["IamResourceType"].lower()),
            **get_params
        )
        print(get_inline)
        current_policy = loads(get_inline["PolicyDocument"])
        if sort_multilevel_obj(current_policy) != sort_multilevel_obj(loads(policy["Document"])):
            update_params = kwargs
            update_params[""] = policy["Name"]
            update_params[""] = policy["Document"]
            update_inline = my_aws_methods(
                iam_client,
                "put_{}_policy".format(my_event["IamResourceType"].lower()),
                **update_params
            )
            print(update_inline)

### Compares managed policies with the ones should exist ###

# if managed policy should not exist, deletes it
for policy in attached_policies:
    if policy["PolicyName"] not in template_attached_policies:
        detach_params = kwargs
        detach_params["PolicyArn"] = policy["PolicyArn"]
        detach_policy = my_aws_methods(
            iam_client,
            "detach_{}_policy".format(my_event["IamResourceType"].lower()),
            **detach_params
        )
        print(detach_policy)

for policy in template_attached_policies:
    # if managed policy does not exists, creates it and attaches it
    if policy["Name"] not in attached_policies:
        


# Verifies if managed policy exists but is outdated

# If managed policy version limit is reached, deletes the oldest

# Updates managed policy and sets it to default


