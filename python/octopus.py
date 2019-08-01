import boto3
from os import popen,environ
import re
from json import dumps
import logging
import botocore
from datetime import datetime
from datetime import date
from ast import literal_eval

logger = logging.Logger("catch_all")

# ============================================================================#
#                          EXECUTES BOTO3 METHODS                             #
# ============================================================================#
# This should only be used in cases where too many similar methods are called
def my_aws_methods(client,resource_action,**kwargs):
    try:
        func = getattr(client,resource_action) # Impersonates selected method
        resources = func(**kwargs) # runs method with its necessary arguments
        return my_logging(resources)
    except botocore.exceptions.ClientError as e:
        if e.response["Error"]["Code"] == "NoSuchEntity":
            return my_logging("NoSuchEntity","warning")
        else:
            my_logging(e.response["Error"],"error")
            return e

# ============================================================================#
#               LIST RESOURCES ON AWS THAT NEEDS PAGINATION                   #
# ============================================================================#
def list_resources(client,resource,resource_action,token_name,**kwargs):

    page = 1
    resource_list = my_aws_methods(client,resource_action,**kwargs)
    print('Page 1: %s' % resource_list)
    resources = resource_list[resource]
    print(resources)
    while token_name in resource_list:
        kwargs[token_name]=resource_list[token_name]
        page += 1
        resource_list = my_aws_methods(client,resource_action,**kwargs)
        print('Page %s: %s' % (page,resource_list))
        resources.extend(resource_list[resource])

    return resources

# ============================================================================#
#              LOGS EVENTS AND SENDS THEM TO THE RIGHT PLACE                  #
# ============================================================================#
def my_logging(msg,type="info"):
    print(msg)
    return msg

# ============================================================================#
#                     GET CREDENTIALS FOR AWS SERVICES                        #
# ============================================================================#
def get_creds(aws_service,**kwargs):
    if "Id" not in kwargs:
        return boto3.client(aws_service)
    else:
        try:
            sts = boto3.client("sts")
        except botocore.exceptions.ClientError as e:
            return my_logging(e,"error") 

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
            return my_logging(e,"error")

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
            return my_logging(e,"error")

# ============================================================================#
#                   SENDS MESSAGE TO SQS QUEUE SPECIFIED                      #
# ============================================================================#
def send_sqs(msg,sqs_url):
    sqs_client = get_creds("sqs")
    try:
        response = sqs_client.send_message(
            QueueUrl=sqs_url,
            MessageBody=dumps(msg)
        )
        return my_logging("{} - {}".format(msg,response))
    except botocore.exceptions.ClientError as e:
        return my_logging(e,"error")

# ============================================================================#
#                   SENDS MESSAGE TO SNS QUEUE SPECIFIED                      #
# ============================================================================#
def send_sns(subject,msg,topic_arn):
    sns_client = get_creds("sns")
    try:
        response = sns_client.publish(
            TopicArn=topic_arn,
            Message=str(msg),
            Subject=subject,
        )
        return response
    except botocore.exceptions.ClientError as e:
        return my_logging(e,"error")        

# ============================================================================#
#          VERIFIES IF POLICY IS TOO PERMISSIVE ALLOWING FULL ACCESS          #
# ============================================================================#
def is_full_access(action,Id,Email,Resource,Resource_name,Policy,sqs_url):
    if action in ["*","*:*"]:
        msg = {
            "Alert":"Policy Too Permissive - Full Access found",
            "Id":Id,
            "Email":Email,
            Resource:Resource_name,
            "Policy": Policy
        }
        
        return send_sqs(str(msg),sqs_url)

    else:
        return False

# ============================================================================#
#            QUERY ITEMS FROM DYNAMO PAGINATING TO GET ALL ITEMS              #
# ============================================================================#
def query_items(tableName,indexName,columns,expression,attrNames,attrValues):
    
    dynamodb_client = get_creds("dynamodb")

    page = 1
    items = [] # creates an empty list to add items retrieved with query
    # Sets parameters that will be passed to 'query' method
    params = {
        "TableName":tableName,
        "ReturnConsumedCapacity":"INDEXES",
        "ProjectionExpression":columns,
        "KeyConditionExpression":expression,
        "ExpressionAttributeNames":attrNames,
        "ExpressionAttributeValues":attrValues
    }
    if indexName != None:
        params["IndexName"] = indexName

    # Get the first set of items with query method
    response = dynamodb_client.query(**params)
    items.extend(response["Items"]) # Adds items to list
    print("Query - page {}: {}".format(page,response))

    # Verifies if there are more items to be retrieved
    while "LastEvaluatedKey" in response:
        # Adds the parameter that will paginate the query
        # To retrieve aditional items
        params["ExclusiveStartKey"] = {
            params["ExpressionAttributeNames"]["#key"]:response["LastEvaluatedKey"]
        }
        page += 1

        # Get remained items
        response = dynamodb_client.query(**params)
        items.extend(response["Items"]) # Adds items to list
        print("Query - page {}: {}".format(page,response))

    print("Query completed: {}".format(items))
    return items

# ============================================================================#
#            SORTS A LIST NESTED IN AN OBJECT IN ASCENDING ORDER              #
# ============================================================================#
def sort_multilevel_obj(items):
    if isinstance(items, dict):
        for v in items.values():
            v = sort_multilevel_obj(v)
    if isinstance(items, list):
        items.sort()
        for i in items:
            i = sort_multilevel_obj(i)

    return items

# ============================================================================#
#                     DOWNLOAD FILE FROM S3 AS A VARIABLE                     #
# ============================================================================#
def get_file_from_s3(bucket_name,file_path):
    s3_client = get_creds("s3")

    # Retrieves SAML file from S3 bucket
    my_file = s3_client.get_object(
        Bucket=bucket_name,
        Key=file_path
    )["Body"].read().decode("utf-8")

    my_logging("File retrieved: {}".format(my_file))

    return my_file

# ============================================================================#
#                      CONVERTS DATETIME TO JSON SERIAL                       #
# ============================================================================#
def json_serial(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()

# ============================================================================#
#         HANDLES TRIGGER EVENT WHETHER IS SINGLE MESSAGE OR BATCH JOB        #
# ============================================================================#
def handle_event_trigger(event):
    my_logging("Event Received on Lambda Trigger: {}".format(event))
    # Verifies if the event has more then 1 message in payload

    # This happens with multiple SQS messages in batch jobs
    if "Records" in event:
        my_logging("{} messages for batch job".format(len(event["Records"])))
        for record in event["Records"]:
            my_logging("Working on message: {}".format(record))
            main_function(literal_eval(record["body"]))

    # This happens when function is triggered directly by another lambda or api
    else:
        my_logging("Single message in event. Trigger directly by api request")
        my_logging("Working on message: {}".format(event))
        main_function(event)

# ============================================================================#
#                 LIST ALL LINKED ACCOUNTS ON A PAYER ACCOUNT                 #
# ============================================================================#
def list_linked_accounts(payer_id,**kwargs):
    my_logging("retrieving linked accounts under account {}".format(payer_id))

    if "role" in kwargs:
            role = kwargs["role"]
    else:
        role = "octopus_svc"

    orgs_client = get_creds("organizations",Id=payer_id,role=role)

    linked_accounts = orgs_client.list_accounts()
    my_logging(linked_accounts)
    print()
    accounts = linked_accounts['Accounts']
    while 'NextToken' in linked_accounts:
        token=linked_accounts['NextToken']
        linked_accounts = orgs_client.list_accounts(NextToken=token)
        accounts.extend(linked_accounts['Accounts'])
        my_logging(linked_accounts)
        print()
    
    return dumps(accounts,default=json_serial)