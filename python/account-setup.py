from os import environ,popen
import octopus

def lambda_handler(event, context):
    print('message received on function trigger: %s' % event)
    if octopus.validate_event_data(event):
        var_list = [{'account_alias':event['Name']},
                    {'accountid':event['Id']},
                    {'cloudtrail':event['cloudtrail']},
                    {'intranetIP':event['intranetIP']},
                    {'company_name':environ['company_name']},
                    {"mngt_account_id":environ['mngt_account_id']}]
        set_env = octopus.set_env_for_tf(
            event['Environment'],
            environ['terraform_config_bucket'],
            octopus.get_tf_files(event['Id'],environ['table_name']),
            var_list)
        if set_env == True:
            octopus.setup_terraform(
                environ['backend_bucket'],
                environ['dynamodb_table'],
                environ['kms_key_id'],
                event['Environment'],
                environ['terraform_config_bucket'])
            popen(' rm -rf /tmp/*').read()