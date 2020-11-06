import boto3
import uuid

def save_account_db(name_account,email_account):
    '''
    Insert the name account create to make the index
    '''
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_account")
    
    uuid_set = str(uuid.uuid4())

    item = {
        "UUID": uuid_set,
        "NameAccount": name_account,
        "EmailAccount": email_account,
        "AccountStatus": "NOT_CREATED"
    }

    table.put_item( Item=item )

    return uuid_set


def insert_account_id_db(uuid, account_id_generated):
    '''
    After create the index of the name account, update to insert the aws_account_id generated
    '''
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_account")
    table.update_item(
        Key={"UUID":uuid},
        UpdateExpression="set AccountId=:ai",
        ExpressionAttributeValues={":ai":account_id_generated}
        )

def update_account_id_status(uuid, status):
    '''
    After create the index of the name account, update to insert the aws_account_id generated
    '''
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_account")
    table.update_item(
        Key={"UUID":uuid},
        UpdateExpression="set AccountStatus=:as",
        ExpressionAttributeValues={":as":status.upper()}
    )


#octopus_account_compliance