import octopus

def lambda_handler(event, context):
    print('message received on function trigger: %s' % event)
    if octopus.validate_event_data(event):
        iam_client = octopus.assume_role(
            event['Id'],
            event['role_name'],
            event['session_name'],
            'iam',
            'us-east-1')

        delete_key_pair = iam_client.delete_access_key(
            UserName=event['username'],
            AccessKeyId=event['access_key']
        )

        print(delete_key_pair)