import json
import botocore
import boto3
from os import environ

def get_creds(aws_service,**kwargs):
    if "Id" not in kwargs:
        return boto3.client(aws_service)
    else:
        try:
            sts = boto3.client("sts")
        except botocore.exceptions.ClientError as e:
            raise e
            #return my_logging(e,"error") 

        if "role" in kwargs:
            role = kwargs["role"]
        else:
            role = "octopusmngt"

        if "session_name" in kwargs:
            session_name = kwargs["session_name"]
        else:
            session_name = "octopusroleassumed"
        
        try:
            role = sts.assume_role(
                RoleArn="arn:aws:iam::{}:role/{}".format(kwargs["Id"],role),
                RoleSessionName=session_name
            )
        except botocore.exceptions.ClientError as e:
            raise e
            #return my_logging(e,"error")

        if "region" in kwargs:
            region = kwargs["region"]
        else:
            region = "us-east-2"       

        try:    
            client = boto3.client(
                aws_service,
                region_name=region,
                aws_access_key_id=role['Credentials']['AccessKeyId'],
                aws_secret_access_key=role['Credentials']['SecretAccessKey'],
                aws_session_token=role['Credentials']['SessionToken']
            )
            return client
        except botocore.exceptions.ClientError as e:
            raise e
            #return my_logging(e,"error")


def check_cloudtrail(accounts):
    not_compliance = []
    header = "Account,ARN TRAIL,STATUS,MULTI REGION"
    not_compliance.append(header)
    print(header)

    for account in accounts['accounts']:
        try:
            cloudtrail = get_creds('cloudtrail',Id=account['Id'])
            trails = cloudtrail.list_trails()
            # print(trails)
            if not trails['Trails']:
                message = "{0}({1}),{2},{3},{4}".format(account['Name'], account['Id'], "null", "FALSE", "FALSE")
                not_compliance.append(message)
                print(message)

            for trail in trails['Trails']:
                multi_region = cloudtrail.get_trail(Name=trail['TrailARN'])['Trail']['IsMultiRegionTrail']
                status = cloudtrail.get_trail_status(Name=trail['TrailARN'])
                message = "{0}({1}),{2},{3},{4}".format(account['Name'], account['Id'], trail['TrailARN'], status['IsLogging'], multi_region)
                print(message)
                not_compliance.append(message)

        except botocore.exceptions.ClientError as error:
            if error.response['Error']['Code'] == "AccessDenied":
                message = "{0}({1}),{2},{3},{4}".format(account['Name'], account['Id'], "ERROR AccessDenied", "ERROR AccessDenied", "ERROR AccessDenied")
                not_compliance.append(message)
                print(message)
                
        except Exception as e:
            # raise e
            print(e)
            message = "{0}({1}),{2},{3},{4}".format(account['Name'], account['Id'], "ERROR", "ERROR", "ERROR")
            not_compliance.append(message)
            print(message)

    return not_compliance


def check_default_roles(accounts):
    default_roles = [
        "accessmngt",
        "businessops"
    ]


def lambda_handler(event, context):
    
    lam = boto3.client("lambda")
    resp = lam.invoke(
        FunctionName="octopus-aws-api-get_accounts_organizations-dev",
        InvocationType="RequestResponse",
        LogType="Tail"
    )

    accounts = json.loads( json.loads(resp['Payload'].read().decode())['body'] )
    # sqs_client = boto3.client("sqs")
    
    not_compliance = check_cloudtrail(accounts)
        
    if not_compliance:
        format_message = "\n".join(not_compliance)
        message = "This message was automatically sent to inform the status of basic resources that need to have in each account\n\n"
        message += "The following results have been obtained:\n\n"
        message += format_message

        lam = boto3.client("lambda")
        resp = lam.invoke(
            FunctionName=environ["LAMBDA_SEND_EMAIL"],
            # FunctionName="octopussns-api-get_accounts_organizations-dev",
            InvocationType="RequestResponse",
            LogType="Tail",
            Payload=json.dumps(
                {
                    "subject":"Octopus Report Check (AWS)",
                    "message":message
                }
            )
        )
        
        