import boto3
from json import dumps,loads
from os import environ
import botocore
   
   
   
lambda_client = boto3.client("lambda")
sqs_client = boto3.client("sqs")
dynamodb_client = boto3.client("dynamodb")

roles = {
        "resource":"Roles",
        "resource_name_tag":"RoleName",
        "action_list_resource":"list_roles",
        "action_list_resource_policies":"list_role_policies",
        "action_get_resource_policy":"get_role_policy",
        "action_list_attached_policies":"list_attached_role_policies",
        "session_name":"describeroles",
        "token_name":"Marker"
    }
users = {
        "resource":"Users",
        "resource_name_tag":"UserName",
        "action_list_resource":"list_users",
        "action_list_resource_policies":"list_user_policies",
        "action_get_resource_policy":"get_user_policy",
        "action_list_attached_policies":"list_attached_user_policies",
        "session_name":"describeusers",
        "token_name":"Marker"
    }
groups = {
        "resource":"Groups",
        "resource_name_tag":"GroupName",
        "action_list_resource":"list_groups",
        "action_list_resource_policies":"list_group_policies",
        "action_get_resource_policy":"get_group_policy",
        "action_list_attached_policies":"list_attached_group_policies",
        "session_name":"describegroups",
        "token_name":"Marker"
    }

iam_list = [roles,users,groups]

def lambda_handler(event, context):    
    accounts = loads(
        lambda_client.invoke(
            FunctionName="getLinkedAccounts",
            InvocationType="RequestResponse",
            LogType="Tail",
            Payload=dumps(
                {
                    "payer_id": environ["payer_id"],
                    "role_name": environ["payer_role"]
                }
            )
        )["Payload"].read().decode("utf-8")
    )

    for account in accounts:
        try:
            insert = dynamodb_client.put_item(
                TableName= environ["accounts_table"],
                Item={
                    "Id": {
                        "S": account["Id"]
                    },
                    "Name": {
                        "S": account["Name"]
                    },
                    "Email": {
                        "S": account["Email"]
                    },
                    "Arn": {
                        "S": account["Arn"]
                    },
                    "Status": {
                        "S": account["Status"]
                    },
                    "JoinedMethod": {
                        "S": account["JoinedMethod"]
                    }
                },
                ReturnConsumedCapacity="TOTAL",
                ConditionExpression="attribute_not_exists(Id)"
            )
            print("Account {} recorded on Dynamo: {}".format(account["Id"],insert))
        except botocore.exceptions.ClientError as e:
            if e.response['Error']['Code'] != 'ConditionalCheckFailedException':
                raise

        if account["Status"] == "ACTIVE":
            for resource in iam_list:
                resource["account"] = account
                response = sqs_client.send_message(
                    QueueUrl=environ["sqs_url"],
                    MessageBody=dumps(resource)
                )
                print("message to account {} - {} sent: {}".format(
                    account["Id"],
                    resource["resource"],
                    response)
                )