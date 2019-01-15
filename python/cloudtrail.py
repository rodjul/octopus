from os import environ,popen
from json import loads
import octopus

def lambda_handler(event, context):
    print('message received on function trigger: %s' % event)
    if octopus.validate_event_data(event):
        s3_client = octopus.assume_role(
            environ['cloudtrail_id'],
            'octopus_svc',
            'changebucketpolicy',
            's3',
            environ['cloudtrail_region'])

        account_arn = 'arn:aws:s3:::%s/AWSLogs/%s/*' % (event['cloudtrail'],event['Id'])

        bucket_policy = s3_client.get_bucket_policy(Bucket=event['cloudtrail'])
        print(bucket_policy)

        account_arns = loads(bucket_policy['Policy'])['Statement'][1]['Resource']
        print('Current bucket policy has %s Arns allowed...' % (len(account_arns)))
        if account_arn not in account_arns:
            account_arns.append(account_arn)
            print('New bucket policy will have %s Arns allowed...' % (len(account_arns)))
        
        account_arns = sorted(account_arns, reverse=True)
        var_list = [
            {'cloudtrail':event['cloudtrail']},
            {'cloudtrailid':environ['cloudtrail_id']},
            {'accountid':event['Id']},
            {'accountids_cloudtrail':account_arns}
        ]
        set_env = octopus.set_env_for_tf(
            event['Environment'],
            environ['terraform_config_bucket'],
            octopus.get_tf_files(event['Environment'],environ['table_name']),
            var_list)
        if set_env == True:
            octopus.setup_terraform(
                environ['backend_bucket'],
                environ['dynamodb_table'],
                environ['kms_key_id'],
                event['Environment'],
                environ['terraform_config_bucket'])
            popen(' rm -rf /tmp/*').read()