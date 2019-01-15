import boto3
from os import environ,popen
from json import dumps,loads
import octopus

def lambda_handler(event, context):
    print('message received on function trigger: %s' % event)
    if octopus.validate_event_data(event):
        var_list = [{'payerid':event['payer_id']}]
        lambda_client = boto3.client('lambda')
        s3_client = boto3.client('s3')
        iam_client = octopus.assume_role(
            event['payer_id'],
            'octopus_svc',
            'createroletonewaccount',
            'iam',
            'us-east-1')
        set_env = octopus.set_env_for_tf(
            event['Environment'],
            environ['terraform_config_bucket'],
            octopus.get_tf_files(
                event['Environment'],
                environ['table_name']),
                var_list)
        if set_env == True:
            # tf_environment = octopus.setup_terraform(
            #     environ['backend_bucket'],
            #     environ['dynamodb_table'],
            #     environ['kms_key_id'],
            #     event['Environment'],
            #     environ['terraform_config_bucket'])
            # if tf_environment == True:
            if 1 == 1:
                print('New account %s created' % (event['Name']))
                print('Searching terraform state file for new accountId..')
                tf_state = s3_client.get_object(
                    Bucket=environ['backend_bucket'],
                    Key='workspace/%s/backend' % (event['Environment'])
                )
                print('Answer from get_object command: %s' % tf_state)
                content = loads(tf_state['Body'].read().decode('utf-8'))
                print('State File: %s' % content)
                account_id = content['modules'][0]\
                ['resources']['aws_organizations_account.%s' \
                % event['Name']]['primary']['id']
                print('Account ID for the new account is: %s' % account_id)
                print('Saving data about new account on database...')
                insert_account = lambda_client.invoke(
                    FunctionName=environ['insert_account_function'],
                    InvocationType='RequestResponse',
                    LogType='Tail',
                    Payload=dumps({"Id":account_id,"payer_id":event['payer_id']})
                )
                print('''Answer from LambdaFunction to Insert Account: %s \
                ''' % insert_account['Payload'].read())
                print('Creating Cross Account Role for Octopus...')
                print('Creating temporary key...')
                create_key = iam_client.create_access_key(
                    UserName='octopus'
                )
                print('''Create Key Status: %s \
                ''' % create_key['ResponseMetadata'])
                var_list = [
                    {"accesskey":create_key['AccessKey']['AccessKeyId']},
                    {"secretkey":create_key['AccessKey']['SecretAccessKey']},
                    {"id":account_id},
                    {"mngt_account_id":environ['mngt_account_id']}]
                set_env = octopus.set_env_for_tf(
                    event['Name'],
                    environ['terraform_config_bucket'],
                    octopus.get_tf_files(
                        'new-account-conf',
                        environ['table_name']),
                    var_list)
                if set_env == True:
                    octopus.init_terraform(
                        environ['backend_bucket'],
                        environ['dynamodb_table'],
                        environ['kms_key_id'],
                        event['Name'],
                        environ['terraform_config_bucket'])
                    print('Creating workspace for the new account...')
                    print(popen('''cd /tmp/%s && /tmp/terraform workspace new %s \
                    ''' % (event['Name'],event['Name'])).read())
                    print('Workspace created...')
                    tf_environment = octopus.setup_terraform(
                        environ['backend_bucket'],
                        environ['dynamodb_table'],
                        environ['kms_key_id'],
                        event['Name'],
                        environ['terraform_config_bucket'])
                    iam_client.delete_access_key(
                        UserName='octopus',
                        AccessKeyId=create_key['AccessKey']['AccessKeyId']
                    )
                    popen(' rm -rf /tmp/*').read()
                    if tf_environment == True:
                        print('setup completed...')
            else:
                print('Command unsuccessfull... please see output:  ' + tf_environment)