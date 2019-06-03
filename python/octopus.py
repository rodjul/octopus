import boto3
from os import popen,environ
import re
from json import dumps
import logging
import botocore

logger = logging.Logger('catch_all')

def init_terraform(
    bucket,
    dynamodb_table,
    kms_key_id,
    environment,
    terraform_config_bucket):
    s3 = boto3.resource('s3')
    s3.meta.client.download_file(
        terraform_config_bucket,
        'terraform',
        '/tmp/terraform')
    popen('chmod 777 /tmp/terraform').read()
    print('Initiating Terraform...')
    init = popen('''
    cd /tmp/%s && /tmp/terraform init -backend-config='bucket="%s"' \
    -backend-config='dynamodb_table="%s"' \
    -backend-config='kms_key_id ="%s"' \
    ''' % (environment,bucket,dynamodb_table,kms_key_id)).read()
    print('Terraform init Command executed...')
    print(init)
    if (init.find('Successfully configured the backend "s3"') > -1 or \
    init.find('Initializing the backend') > -1) and \
    init.find('Terraform has been successfully initialized') > -1:
        return True
    else:
        print('Error: Could not initiate terraform. \
        Please see the command output: %s ' % init)
        return False

def setup_terraform(
    bucket,
    dynamodb_table,
    kms_key_id,
    environment,
    terraform_config_bucket):
    if init_terraform(
            bucket,
            dynamodb_table,
            kms_key_id,
            environment,
            terraform_config_bucket) == True:
        print('Selecting workspace...')
        workspace = popen('''
        cd /tmp/%s && /tmp/terraform workspace select %s \
        ''' % (environment,environment)).read()
        print('terraform select workspace Commands executed...')
        print(workspace)
        if workspace.find('Switched to workspace "%s"' % (environment)) > -1:
            print('Terraform Setup Ok...')
            print('Running Terraform Apply. Please wait...')
            apply = popen('''
            cd /tmp/%s && /tmp/terraform apply -input=false -auto-approve \
            ''' % (environment) ).read()
            print('terraform apply command executed...')
            print(apply)
            if apply.find('Apply complete') > -1:
                return True
            else:
                print('Error: Could not execute Terraform. \
                Please see the command output: %s' % apply)
                return False
        else:
            print('Error: Could not switch to %s workspace. \
            Please see the command output: %s' % (environment,workspace))
            return False

# assumes a role with the service and region necessaries
def assume_role(Id,role,session_name,aws_service,region='us-east-2'):
    sts_client = boto3.client('sts')
    try:
        assume_role = sts_client.assume_role(
            RoleArn='arn:aws:iam::%s:role/%s' % (Id,role),
            RoleSessionName=session_name
        )
    except Exception as e:
        logger.error(e, exc_info=True)
        print('Could not assume IAM on account %s. Error: %s' % (
            str(Id),
            str(e))
        )
    credentials = assume_role['Credentials']
    client = boto3.client(
        aws_service,
        region_name=region,
        aws_access_key_id=credentials['AccessKeyId'],
        aws_secret_access_key=credentials['SecretAccessKey'],
        aws_session_token=credentials['SessionToken']
    )
    return client

def get_tf_files(Id,acc_conf_table):
    dynamodb_client = boto3.client('dynamodb')
    item = dynamodb_client.get_item(
        TableName= acc_conf_table,
        Key={
            'Id': {
            'S': Id
            }
        },
        ReturnConsumedCapacity='TOTAL',
        ConsistentRead=True,
    )
    print('item: %s' % item)
    conf_list = []
    for i in item['Item']['config_files']['L']:
        conf_list.append(i['S'])
    print(conf_list)
    return conf_list
     

def set_env_for_tf(environment,conf_files_bucket,conf_files,variables):
    print(popen('mkdir /tmp/%s && cd /tmp/%s && pwd && ls\
    ' % (environment,environment)).read())
    for i in conf_files:
        try:
            s3 = boto3.resource('s3')
            s3.meta.client.download_file(
                conf_files_bucket,
                'files/%s' % i,
                '/tmp/%s/%s' % (environment,i))
        except:
            print('file %s not found' % i)
    var_file = ''
    for var in variables:
        for k,v in var.items():
            var_file += '''
%s = %s
''' % (k,dumps(v))
    print('Variables File: ')
    print(var_file)
    f = open('/tmp/%s/terraform.tfvars' % environment,'w')
    f.write(var_file)
    f.close()
    change_dir = popen('cd /tmp/%s && pwd' % environment).read()
    print('Switched to Directory: %s' % change_dir)
    list_conf_file = popen('ls /tmp/%s ' % environment).read()
    print(list_conf_file)
    if list_conf_file.find('provider.tf') > -1:
        return True
    else:
        return False

def validate_event_data(payload):
    def is_ip_address(ip_list):
        b=re.compile(r'[0-9]+'+'.'+'[0-9]+'+'.'+'[0-9]+'+'.'+'[0-9]+')
        for ip in ip_list:
            if b.search(ip):
                print(b.search(ip).group())
                for x in re.split('[. /]',ip):
                    if not 0 < int(x) < 255:
                        print('Invalid octect for Ip Address: %s' % x)
                        return False
                return True

    unauthorized_characters = re.compile(r'''[' " ! @ # $ % "& * ( ) + = § ' ` { } ~ ^ / ? ; : . > , < | \\ ]''')
    Id_pattern = re.compile(r'(\d){12}')
    uppercase = re.compile(r'([A-Z])')
    access_key_pattern = re.compile(r'(\d|[A-Z]){20}')


    if 'Name' in payload and \
    (unauthorized_characters.search(payload['Name'])):
        print('Name contains characters not allowed. \
        Please do not use the following characters: %s\
        ' % unauthorized_characters)
        return False
        
    if 'Id' in payload and \
    (Id_pattern.search(payload['Id']) == None ):
        print('Id must be decimal and 12 digits long')
        return False

    if 'cloudtrail' in payload and \
    (unauthorized_characters.search(payload['cloudtrail']) \
    or uppercase.search(payload['cloudtrail'])):
        print('bucket name contains characters not allowed. \
        Please do not use uppercase letters, "_" or the \
        following characters: %s' % unauthorized_characters)
        return False

    if 'intranetIP' in payload and \
    (is_ip_address(payload['intranetIP']) != True):
        print('Invalid IP Address.')
        return False

    if 'Environment' in payload and \
    (unauthorized_characters.search(payload['Environment'])):
        print('Environment contains characters not allowed. \
        Please do not use the following characters: %s\
        ' % unauthorized_characters)
        return False

    if 'password' in payload and ' ' in payload['password']:
        print('Password cannot contain spaces.')
        return False

    if 'role_name' in payload and \
    (unauthorized_characters.search(payload['role_name'])):
        print('Role name contains characters not allowed. \
        Please do not use the following characters: %s\
        ' % unauthorized_characters)
        return False

    if 'session_name' in payload and \
    (unauthorized_characters.search(payload['session_name'])):
        print('Environment contains characters not allowed. \
        Please do not use "-", "_" nor the following characters: \
        %s' % unauthorized_characters)
        return False

    if 'username' in payload and \
    (unauthorized_characters.search(payload['username'])):
        print('Username contains characters not allowed. \
        Please do not use the following characters: %s\
        ' % unauthorized_characters)
        return False

    if 'payer_id' in payload and \
    (Id_pattern.search(payload['payer_id']) == None ):
        print('Id must be decimal and 12 digits long')
        return False

    if 'access_key' in payload and \
    (access_key_pattern.search(payload['access_key']) == None ):
        print('Invalid Access_Key')
        return False
    
    if 'config_files' in payload and \
    (type(payload['config_files']) != list):
        print('Config Files must be a list.')
        return False
    
    if 'groups' in payload and \
    (type(payload['groups']) != list):
        print('Groups must be a list.')
        return False

    if 'users' in payload and \
    (type(payload['users']) != list):
        print('Users must be a list.')
        return False

    if 'membership' in payload and \
    (type(payload['membership']) != list):
        print('Membership must be a list.')
        return False
    
    if 'policy' in payload and \
    (type(payload['policy']) != list):
        print('Policy must be a list.')
        return False
    
    if 'policy_attachment' in payload and \
    (type(payload['policy_attachment']) != list):
        print('policy_attachment must be a list.')
        return False

    return True

# Executes boto3 methods
# This should only be used in cases where too many similar methods are called
def my_aws_methods(client,resource_action,**kwargs):
    try:
        func = getattr(client,resource_action) # Impersonates selected method
        resources = func(**kwargs) # runs method with its necessary arguments
        return print(resources)
    except botocore.exceptions.ClientError as e:
        return my_logging(e,"error")  

# List resources on AWS that needs pagination
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

# Logs events and sends them to the right place
def my_logging(msg,type="info"):
    print(msg)
    return msg


# Get credentials for AWS Service
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

# Send message to sqs queue specified
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

# Verifies if policy is too permissive allowing full access
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

# Query items from dynamodb table paginating until all items are retrived
def query_items(tableName,indexName,columns,expression,attrNames,attrValues):
    
    dynamodb_client = get_creds("dynamodb")

    page = 1
    items = [] # creates an empty list to add items retrieved with query
    # Sets parameters that will be passed to 'query' method
    params = {
        "TableName":tableName,
        "IndexName":indexName,
        "ReturnConsumedCapacity":"INDEXES",
        "ProjectionExpression":columns,
        "KeyConditionExpression":expression,
        "ExpressionAttributeNames":attrNames,
        "ExpressionAttributeValues":attrValues
    }

    # Get the first set of items with query method
    response = dynamodb_client.query(**params)
    items.extend(response["Items"]) # Adds items to list
    print("Query - page {}: {}".format(page,response))

    # Verifies if there are more items to be retrieved
    while "LastEvaluatedKey" in response:
        # Adds the parameter that will paginate the query to retrieve aditional items
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

# Sorts a list nested in an object in ascending order
def sort_multilevel_obj(items):
    if isinstance(items, dict):
        for v in items.values():
            v = sort_multilevel_obj(v)
    if isinstance(items, list):
        items.sort()
        for i in items:
            i = sort_multilevel_obj(i)

    return items