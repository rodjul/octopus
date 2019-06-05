from octopus import get_creds
from octopus import list_resources
from octopus import my_aws_methods
from octopus import my_logging
from octopus import sort_multilevel_obj
from octopus import query_items
from json import loads,dumps
from os import environ


# Verifies if resource does not exist yet and creates it or updates it
def create_iam_resource(iam_client,**resource):
    # Sets parameters to use on get request
    kwargs = {
        "{}Name".format(resource["ResourceType"]["S"]):resource["ResourceName"]["S"]
    }
    # Logs variable created
    my_logging("kwargs for get_{}: {}".format(
        resource["ResourceType"]["S"].lower(),
        kwargs
    ))

    # Get information about resource when created
    get_resource = my_aws_methods(
        iam_client,
        "get_{}".format(resource["ResourceType"]["S"].lower()),
       **kwargs
    )
 
    # Verifies if resource was retrivied or did not exist
    if get_resource == "NoSuchEntity":
        
        # If the resource is a Role
        # adds more parameters to kwargs
        if resource["ResourceType"]["S"] == "Role":
            kwargs["AssumeRolePolicyDocument"] = str(resource["AssumeRolePolicy"]["S"])
            kwargs["Description"] = resource["Description"]["S"]
            if "MaxSession" in resource:
                kwargs["MaxSessionDuration"] = int(resource["MaxSession"]["N"])
                my_logging("kwargs updated: {}".format(kwargs))    

        # Creates resource
        create_resource = my_aws_methods(
            iam_client,
            "create_{}".format(resource["ResourceType"]["S"].lower()),
            **kwargs
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
                RoleName=resource["ResourceName"]["S"],
                Description=resource["Description"]["S"]
            )
            my_logging("Description updated: {}".format(description))
            get_resource["Role"]["Description"] = resource["Description"]["S"]

        # If resource is a role,
        # and max session duration is incorrect, updates it
        if "MaxSession" in resource and \
        get_resource["Role"]["MaxSessionDuration"] != resource["MaxSession"]["N"]:
            max_session = iam_client.update_role(
                RoleName=resource["ResourceName"]["S"],
                MaxSessionDuration=int(resource["MaxSession"]["N"])
            )
            my_logging("Session Duration updated: {}".format(max_session))
            get_resource["Role"]["MaxSessionDuration"] = resource["MaxSession"]["N"]

        # If resource is a role,
        # updates assume-role-policy-document when necessary
        if "AssumeRolePolicy" in resource and \
        sort_multilevel_obj(get_resource["Role"]["AssumeRolePolicyDocument"]) != sort_multilevel_obj(loads(resource["AssumeRolePolicy"]["S"])):
                update_assume_role = iam_client.update_assume_role_policy(
                    RoleName=resource["ResourceName"]["S"],
                    PolicyDocument=str(resource["AssumeRolePolicy"]["S"])
                )
                my_logging("Assume Policy updated: {}".format(
                    update_assume_role))
                    
                get_resource["Role"]["AssumeRolePolicyDocument"] = resource["AssumeRolePolicy"]["S"]

        return my_logging({
            "status":"existent",
            "resource":get_resource
        })


# ======================================



# Get template managed policies


"""
verificar quais inline policies precisao

verificar quais managed policies precisao

verificar se as managed estão criadas

    verificar se estão atualizadas



quando o recurso já existir
    verificar se já há inline policies

    verificar se já há managed policies
"""

if resource["status"] == "existent":
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

# List managed policies maintained by customer on account
managed_policies = list_resources(
    iam_client,
    "Policies",
    "list_policies",
    "Marker",
    Scope="Local"
)

template_inline_policies_names = []
for i in item["Item"]["InlinePolicies"]["L"]:
    template_inline_policies_names.extend(i["M"]["Name"]["S"])

template_attached_policies_names = []
for i in item["Item"]["ManagedPolicies"]["L"]:
    template_attached_policies_names.extend(i["S"])

managed_policy_names = []
for i in managed_policies:
    managed_policy_names.extend(i["PolicyName"])

### Compares inline policies with the ones should exist ###

# if inline policy should not exist, deletes it
for policy in inline_policies:
    if policy not in template_inline_policies_names:
        delete_params = kwargs
        delete_params["PolicyName"] = policy
        delete_inline = my_aws_methods(
            iam_client,
            "delete_{}_policy".format(my_event["IamResourceType"].lower()),
            **delete_params
        )
        print(delete_inline)

# if inline policy does not exists, creates it
for policy in item["Item"]["InlinePolicies"]["L"]:
    if policy["M"]["Name"]["S"] not in inline_policies:
        create_params = kwargs
        create_params["PolicyName"] = policy["M"]["Name"]["S"]
        create_params["PolicyDocument"] = policy["M"]["Document"]["S"]
        create_inline = my_aws_methods(
            iam_client,
            "put_{}_policy".format(my_event["IamResourceType"].lower()),
            **create_params
        )
        print(create_inline)

    # Verifies if inline policy exists but is outdated and updates it
    else:
        get_params = kwargs
        get_params["PolicyName"] = policy["M"]["Name"]["S"]
        get_inline = my_aws_methods(
            iam_client,
            "get_{}_policy".format(my_event["IamResourceType"].lower()),
            **get_params
        )
        print(get_inline)
        current_policy = loads(get_inline["PolicyDocument"])
        if sort_multilevel_obj(current_policy) != sort_multilevel_obj(loads(policy["M"]["Document"]["S"])):
            update_params = kwargs
            update_params["PolicyName"] = policy["M"]["Name"]["S"]
            update_params["PolicyDocument"] = policy["M"]["Document"]["S"]
            update_inline = my_aws_methods(
                iam_client,
                "put_{}_policy".format(my_event["IamResourceType"].lower()),
                **update_params
            )
            print(update_inline)

### Compares managed policies with the ones should exist ###

# if managed policy should not exist, deletes it
for policy in attached_policies:
    if policy["PolicyName"] not in template_attached_policies_names:
        detach_params = kwargs
        detach_params["PolicyArn"] = policy["PolicyArn"]
        detach_policy = my_aws_methods(
            iam_client,
            "detach_{}_policy".format(my_event["IamResourceType"].lower()),
            **detach_params
        )
        print(detach_policy)

for item in template_attached_policies_names:
    # Retrieves data about the policy on dynamodb
    policy_data = query_items(
        environ["iam_policies_table"],
        None,
        "PolicyName,Description,Document,Arn",
        "#key = :v",
        {"#key":"PolicyName"},
        {":v": {"S": item}}
    )
    
    # Verifies whether is an AWS managed or Local managed policy
    if Document in policy_data:
        my_logging("{} is a Customer Managed Policy".format(policy_data["PolicyName"]["S"]))

        # if managed policy does not exists, creates it
        if item not in managed_policy_names:
            policy = iam_client.create_policy(
                PolicyName=policy_data["PolicyName"]["S"],
                PolicyDocument=policy_data["Document"]["S"],
                Description=policy_data["Description"]["S"]
            )
            my_logging(policy)

        # Verifies if managed policy exists but is outdated
        else:
            for i in managed_policies:
                if i["PolicyName"] == item:
                    versions = list_resources(
                        iam_client,
                        "Versions",
                        "list_policy_versions",
                        "Marker",
                        PolicyArn=i["Arn"]
                    )
                    for ver in versions:
                        if ver["IsDefaultVersion"] == True:
                            default_doc = ver["Document"]
                    
                    
                    

# If managed policy version limit is reached, deletes the oldest

# Updates managed policy and sets it to default


# ============================================
#
# ============================================


def lambda_handler(event,context):
    my_event = {
        "Id":"826839167791"
        "IamResourceType":"Role",
        "IamResourceName":"teste"
    }
    
    iam_client = get_creds(
        "iam",
        Id=my_event["Id"]
    )
    dynamodb_client = get_creds("dynamodb")


    # Get data about desired IAM Resource
    item = dynamodb_client.get_item(
        TableName= environ["iam_resource_table"],
        Key={
                "ResourceName": {
                    "S": my_event["IamResourceName"]
                },
                "ResourceType":{
                    "S":my_event["IamResourceType"]
                }
        },
        ReturnConsumedCapacity="TOTAL",
        ConsistentRead=True
    )
    my_logging(item)

    # Enforces resource creation on account
    resource = create_iam_resource(
        iam_client,
        **item["Item"]
    )






"""
{
    "ResourceName":{"S":"teste"},
    "ResourceType":{"S":"Role"},
    "InlinePolicies":{
        "M":{
            "Name":{"S":"policy-mopa"},
            "Document":{"S":"json"}
        },
        "M":{
            "Name":{"S":"policy-mopa2"},
            "Document":{"S":"json"}
        }
    },
    "ManagedPolicies":{
        "L":[
            {"S":policy-mopa3},
            {"S":AdministratorAccess}
        ]        
    },
    "AssumeRolePolicy":{
        "S":"json"
    },
    "Description:"{"S":"This role is used to test"},
    "MaxSession":{"":7200}
}

{
    "PolicyName":{"S":"policy-mopa3"},
    "Description":{"S":"Testing"}
    "Document":{"S":"json"},
    "Arn":{"S":"arn:aws:iam::aws:policy/{}".format(policy_name)},
}
"""