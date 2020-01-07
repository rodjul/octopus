from octopus import get_creds,query_items,send_sqs
from json import dumps,loads
from os import environ
import botocore

lambda_client = get_creds("lambda")
sqs_client = get_creds("sqs")

# Main function
def lambda_handler(event, context): 
    # Verifies what resource is in execution and sets variables according   
    if event["resource"] == "iam":
        resources = ["Roles","Users","Groups"]
        sqs_url = environ["iam_queue"]

    elif event["resource"] == "instances":
        resources = ["ec2","rds"]
        sqs_url = environ["instances_queue"]
    
    payer_accounts = query_items(
        environ["dynamo_table"],
        environ["index"],
        "Id,Email,#s",
        "#key = :v",
        {"#key":"IsLinked","#s": "Status"},
        {":v": {"S": "False"}}
    )

    accounts = []
    for account in payer_accounts:
        get_accounts = loads(
            lambda_client.invoke(
                FunctionName="getLinkedAccounts",
                InvocationType="RequestResponse",
                LogType="Tail",
                Payload=dumps(
                    {
                        "payer_id": account["Id"]["S"],
                        "role_name": environ["payer_role"]}
                    )
            )["Payload"].read().decode("utf-8")
        )
        accounts.extend(get_accounts)
    
    # Iterates through accounts sending messages to queue
    for account in accounts:
        if account["Status"] == "ACTIVE":
            for resource in resources:
                my_message = send_sqs(
                    {
                        "account":account,
                        "resource":resource
                    },
                    sqs_url
                )
                print(
                    "message to account {} - {} sent: {}".format(
                        account["Id"],
                        resource,
                        my_message
                    )
                )