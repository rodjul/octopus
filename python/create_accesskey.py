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

        key_pair = iam_client.create_access_key(
            UserName=event['username']
        )
        print(key_pair['ResponseMetadata'])
        return key_pair