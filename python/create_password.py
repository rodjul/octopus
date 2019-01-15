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

        console_access = iam_client.create_login_profile(
            UserName=event['username'],
            Password=event['password'],
            PasswordResetRequired=True
        )
        print(console_access)