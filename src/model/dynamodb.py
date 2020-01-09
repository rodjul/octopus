import boto3


def save_account_db(name_account,email_account):
    '''
    Insert the name account create to make the index
    '''
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_account")

    item = {"NameAccount": name_account,
            "EmailAccount": email_account}

    table.put_item( Item=item )


def insert_account_id_db(name_account, account_id_generated):
    '''
    After create the index of the name account, update to insert the aws_account_id generated
    '''
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_account")
    table.update_item(
        Key={"NameAccount":name_account},
        UpdateExpression="set AccountId=:ai",
        ExpressionAttributeValues={":ai":account_id_generated}
        )


#octopus_account_compliance