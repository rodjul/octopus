import boto3
import botocore
import json
import re

'''
References: https://docs.bridgecrew.io/docs/monitoring_1

CIS_Amazon_Web_Services_Foundations_Benchmark_v1.2.0

2.4 Ensure CloudTrail trails are integrated with CloudWatch Logs (Scored) (level 1)
3.1 Ensure log metric filter unauthorized api calls (Scored) (level 1)
3.2 Ensure a log metric filter and alarm exist for Management Console sign-in without MFA (Scored) (level 1)
3.3 Ensure a log metric filter and alarm exist for root usage (Scored) (level 1)
3.4 Ensure a log metric filter and alarm exist for IAM changes (Scored) (level 1)
3.5 Ensure a log metric filter and alarm exist for CloudTrail configuration changes (Scored) (level 1)
3.6 Ensure a log metric filter and alarm exist for console auth failures (Scored) (level 2)
3.7 Ensure a log metric filter and alarm exist for disabling or scheduling deletion of KMS CMK (Scored) (level 2)
3.8 Ensure a log metric filter and alarm exist for S3 bucket policy changes (Scored) (level 1)
3.9 Ensure a log metric filter and alarm exist for for AWS Config configuration changes (Scored) (level 2)
3.10 Ensure a log metric filter and alarm exist for security group changes (Scored) (level 2)
3.11 Ensure a log metric filter and alarm exist for changes to Network Access Control Lists (NACL) (Scored) (level 2)
3.12 Ensure a log metric filter and alarm exist for changes to network gateways (Scored) (level 1)
3.13 Ensure a log metric filter and alarm exist for route table changes (Scored) (level 1)
3.14 Ensure a log metric filter and alarm exist for VPC changes (Scored) (level 1)
'''




def get_creds(aws_service,**kwargs):
    if "Id" not in kwargs or ("Id" in kwargs and not kwargs["Id"]):
        return boto3.client(aws_service)
    else:
        try:
            sts = boto3.client("sts")
        except botocore.exceptions.ClientError as e:
            raise e
            #return my_logging(e,"error")

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
            raise e
            #return my_logging(e,"error")

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
            raise e
            #return my_logging(e,"error")


def create_sns_topic(account_id=None, region_name="us-east-2", topic_name="CISCloudwatchLogs") -> str:
    '''
    Create and return the TopicArn
    '''
    arn_check = f"arn:aws:sns:{region_name}:[0-9]+:{topic_name}"

    sns = get_creds("sns", Id=account_id)

    topics = sns.list_topics()

    topic_arn = None
    for topic in topics['Topics']:
        if re.match(arn_check, topic['TopicArn']):
            topic_arn = topic['TopicArn']
            break

    if not topic_arn:
        response = sns.create_topic(Name=topic_name)
        topic_arn = response['TopicArn']
    
    #TODO: ver novamente esse caso
    response = sns.subscribe(
        TopicArn=topic_arn,
        Protocol='email', # DEFINE PROTOCOL https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/sns.html#SNS.Client.subscribe
        # Endpoint='string',
        # # Attributes={
        #     'string': 'string'
        # },
    )

    subscription_arn = response['SubscriptionArn']

    return {
        "topic_arn": topic_arn,
        "subscription_arn": subscription_arn
    }

def configure_cloudtrail_2_4(account_id=None, cloudtrail_name="totvs-cloudtrail"):
    '''
    2.4 Ensure CloudTrail trails are integrated with CloudWatch Logs (Scored) (level 1)
    '''
    if not account_id:
        account_id = boto3.client('sts').get_caller_identity().get('Account')
    
    # get trail arn and home region
    cloudtrail = get_creds("cloudtrail", Id=account_id)
    # cloudtrail_arn = ""
    cloudtrail_homeregion = ""
    for trail in cloudtrail.list_trails()['Trails']:
        if trail['Name'] == cloudtrail_name:
            # cloudtrail_arn = trail['TrailARN']
            cloudtrail_homeregion = trail['HomeRegion']
            break

    # create cloudwatch logs
    logs = get_creds('logs', Id=account_id)
    
    log_group_name = f"aws-cloudtrail-logs-{account_id}-cc45e322"
    log_group_arn = f"arn:aws:logs:{cloudtrail_homeregion}:{account_id}:log-group:{log_group_name}:*"
    log_stream_name = f"{account_id}_CloudTrail_{cloudtrail_homeregion}"

    response = logs.create_log_group(logGroupName=log_group_name)
    response = logs.create_log_stream(logGroupName=log_group_name,logStreamName=log_stream_name)

    # create iam role
    iam = get_creds("iam", Id=account_id)
    assume_role_policy_document = json.dumps({
        "Version": "2012-10-17",
        "Statement": [
            {
            "Effect": "Allow",
            "Principal": {
                "Service": "cloudtrail.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
            }
        ]
    })

    role_arn = ""
    try:
        response = iam.create_role(
            RoleName=f"CloudTrailRoleForCloudWatchLogs_{cloudtrail_name}",
            AssumeRolePolicyDocument=assume_role_policy_document,
            Description="2.4 Ensure CloudTrail trails are integrated with CloudWatch Logs (Scored) (level 1)"
        )
        role_arn = response['Role']['Arn']
    except Exception as e:
        print("E: ", e)
        response = iam.get_role(RoleName=f"CloudTrailRoleForCloudWatchLogs_{cloudtrail_name}")
        role_arn = response['Role']['Arn']
    
    response = iam.put_role_policy(
        RoleName=f"CloudTrailRoleForCloudWatchLogs_{cloudtrail_name}",
        PolicyName=f"CloudTrailRoleForCloudWatchLogs_{cloudtrail_name}",
        PolicyDocument=json.dumps({
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "AWSCloudTrailCreateLogStream2014110",
                    "Effect": "Allow",
                    "Action": [
                        "logs:CreateLogStream"
                    ],
                    "Resource": [
                        f"arn:aws:logs:{cloudtrail_homeregion}:{account_id}:log-group:{log_group_name}:log-stream:{log_stream_name}*"
                    ]
                },
                {
                    "Sid": "AWSCloudTrailPutLogEvents20141101",
                    "Effect": "Allow",
                    "Action": [
                        "logs:PutLogEvents"
                    ],
                    "Resource": [
                        f"arn:aws:logs:{cloudtrail_homeregion}:{account_id}:log-group:{log_group_name}:log-stream:{log_stream_name}*"
                    ]
                }
            ]
        })
    )

    # update cloudtrail cloudwatch logs
    response = cloudtrail.update_trail(
        Name=cloudtrail_name,
        CloudWatchLogsLogGroupArn=log_group_arn,
        CloudWatchLogsRoleArn=role_arn,
    )
    

def configure_log_3_1(account_id=None, region_name="us-east-2", topic_arn=None, 
    log_group_name="cis_unauthorized_api_calls_metric",
    filter_name="cis_unauthorized_api_calls_metric",
    metric_name="cis_unauthorized_api_calls_metric"):
    '''
    3.1 Ensure a log metric filter and alarm exist for unauthorized API calls (Scored)
    '''
    if not topic_arn:
        raise Exception("Topic ARN does not exists")

    logs = get_creds("logs", Id=account_id)

    logs.put_metric_filter(
        logGroupName=log_group_name,
        filterName=filter_name,
        filterPattern='{($.errorCode = "*UnauthorizedOperation") || ($.errorCode = "AccessDenied*")}',
        metricTransformations=[
            {
                'metricName': metric_name,
                'metricNamespace': 'CISBenchmark',
                'metricValue': '1',
            },
        ]
    )

    cloudwatch = get_creds("cloudwatch", Id=account_id)

    cloudwatch.put_metric_alarm(
        AlarmName=metric_name,
        AlarmDescription='CIS Benchmark - 3.1 Ensure a log metric filter and alarm exist for unauthorized API calls (Scored)',
        AlarmActions=[
            topic_arn,
        ],
        MetricName=metric_name,
        Namespace='CISBenchmark',
        Statistic='Sum',
        Period=300,
        EvaluationPeriods=1,
        Threshold=1,
        ComparisonOperator='GreaterThanOrEqualToThreshold'
    )

def configure_log_3_2(account_id=None, region_name="us-east-2", topic_arn=None, 
    log_group_name="cis_no_mfa_console_signin_metric",
    filter_name="cis_no_mfa_console_signin_metric",
    metric_name="cis_no_mfa_console_signin_metric"):
    '''
    3.2 Ensure a log metric filter and alarm exist for Management Console sign-in without MFA (Scored) (level 1)
    '''
    if not topic_arn:
        raise Exception("Topic ARN does not exists")

    logs = get_creds("logs", Id=account_id)

    logs.put_metric_filter(
        logGroupName=log_group_name,
        filterName=filter_name,
        filterPattern='{($.eventName = "ConsoleLogin") && ($.additionalEventData.MFAUsed != "Yes") }',
        metricTransformations=[
            {
                'metricName': metric_name,
                'metricNamespace': 'CISBenchmark',
                'metricValue': '1',
            },
        ]
    )

    cloudwatch = get_creds("cloudwatch", Id=account_id)

    cloudwatch.put_metric_alarm(
        AlarmName=metric_name,
        AlarmDescription='CIS Benchmark - 3.2 Ensure a log metric filter and alarm exist for Management Console sign-in without MFA (Scored) (level 1)',
        AlarmActions=[
            topic_arn,
        ],
        MetricName=metric_name,
        Namespace='CISBenchmark',
        Statistic='Sum',
        Period=300,
        EvaluationPeriods=1,
        Threshold=1,
        ComparisonOperator='GreaterThanOrEqualToThreshold'
    )

def configure_log_3_3(account_id=None, region_name="us-east-2", topic_arn=None, 
    log_group_name="cis_root_usage_metric",
    filter_name="cis_root_usage_metric",
    metric_name="cis_root_usage_metric"):
    '''
    3.3 Ensure a log metric filter and alarm exist for root usage (Scored) (level 1)
    '''
    if not topic_arn:
        raise Exception("Topic ARN does not exists")

    logs = get_creds("logs", Id=account_id)

    logs.put_metric_filter(
        logGroupName=log_group_name,
        filterName=filter_name,
        filterPattern='{ $.userIdentity.type = "Root" && $.userIdentity.invokedBy NOT EXISTS && $.eventType != "AwsServiceEvent" }',
        metricTransformations=[
            {
                'metricName': metric_name,
                'metricNamespace': 'CISBenchmark',
                'metricValue': '1',
            },
        ]
    )

    cloudwatch = get_creds("cloudwatch", Id=account_id)

    cloudwatch.put_metric_alarm(
        AlarmName=metric_name,
        AlarmDescription='CIS Benchmark - 3.3 Ensure a log metric filter and alarm exist for root usage (Scored) (level 1)',
        AlarmActions=[
            topic_arn,
        ],
        MetricName=metric_name,
        Namespace='CISBenchmark',
        Statistic='Sum',
        Period=300,
        EvaluationPeriods=1,
        Threshold=1,
        ComparisonOperator='GreaterThanOrEqualToThreshold'
    )

def configure_log_3_4(account_id=None, region_name="us-east-2", topic_arn=None, 
    log_group_name="cis_iam_changes_metric",
    filter_name="cis_iam_changes_metric",
    metric_name="cis_iam_changes_metric"):
    '''
    3.4 Ensure a log metric filter and alarm exist for IAM changes (Scored) (level 1)
    '''
    if not topic_arn:
        raise Exception("Topic ARN does not exists")

    logs = get_creds("logs", Id=account_id)

    logs.put_metric_filter(
        logGroupName=log_group_name,
        filterName=filter_name,
        filterPattern='{($.eventName=DeleteGroupPolicy)||($.eventName=DeleteRolePolicy)||($.eventName=DeleteUserPolicy)||($.eventName=PutGroupPolicy)||($.eventName=PutRolePolicy)||($.eventName=PutUserPolicy)||($.eventName=CreatePolicy)||($.eventName=DeletePolicy)||($.eventName=CreatePolicyVersion)||($.eventName=DeletePolicyVersion)||($.eventName=AttachRolePolicy)||($.eventName=DetachRolePolicy)||($.eventName=AttachUserPolicy)||($.eventName=DetachUserPolicy)||($.eventName=AttachGroupPolicy)||($.eventName=DetachGroupPolicy)}',
        metricTransformations=[
            {
                'metricName': metric_name,
                'metricNamespace': 'CISBenchmark',
                'metricValue': '1',
            },
        ]
    )

    cloudwatch = get_creds("cloudwatch", Id=account_id)

    cloudwatch.put_metric_alarm(
        AlarmName=metric_name,
        AlarmDescription='CIS Benchmark - 3.4 Ensure a log metric filter and alarm exist for IAM changes (Scored) (level 1)',
        AlarmActions=[
            topic_arn,
        ],
        MetricName=metric_name,
        Namespace='CISBenchmark',
        Statistic='Sum',
        Period=300,
        EvaluationPeriods=1,
        Threshold=1,
        ComparisonOperator='GreaterThanOrEqualToThreshold'
    )

def configure_log_3_5(account_id=None, region_name="us-east-2", topic_arn=None, 
    log_group_name="cis_cloudtrail_cfg_changes_metric",
    filter_name="cis_cloudtrail_cfg_changes_metric",
    metric_name="cis_cloudtrail_cfg_changes_metric"):
    '''
    3.5 Ensure a log metric filter and alarm exist for CloudTrail configuration changes (Scored) (level 1)
    '''
    if not topic_arn:
        raise Exception("Topic ARN does not exists")

    logs = get_creds("logs", Id=account_id)

    logs.put_metric_filter(
        logGroupName=log_group_name,
        filterName=filter_name,
        filterPattern='{($.eventName = CreateTrail) || ($.eventName = UpdateTrail) || ($.eventName = DeleteTrail) || ($.eventName = StartLogging) || ($.eventName = StopLogging)}',
        metricTransformations=[
            {
                'metricName': metric_name,
                'metricNamespace': 'CISBenchmark',
                'metricValue': '1',
            },
        ]
    )

    cloudwatch = get_creds("cloudwatch", Id=account_id)

    cloudwatch.put_metric_alarm(
        AlarmName=metric_name,
        AlarmDescription='CIS Benchmark - 3.5 Ensure a log metric filter and alarm exist for CloudTrail configuration changes (Scored) (level 1)',
        AlarmActions=[
            topic_arn,
        ],
        MetricName=metric_name,
        Namespace='CISBenchmark',
        Statistic='Sum',
        Period=300,
        EvaluationPeriods=1,
        Threshold=1,
        ComparisonOperator='GreaterThanOrEqualToThreshold'
    )

def configure_log_3_6(account_id=None, region_name="us-east-2", topic_arn=None, 
    log_group_name="cis_console_signin_failure_metric",
    filter_name="cis_console_signin_failure_metric",
    metric_name="cis_console_signin_failure_metric"):
    '''
    3.6 Ensure a log metric filter and alarm exist for console auth failures (Scored) (level 2)
    '''
    if not topic_arn:
        raise Exception("Topic ARN does not exists")

    logs = get_creds("logs", Id=account_id)

    logs.put_metric_filter(
        logGroupName=log_group_name,
        filterName=filter_name,
        filterPattern='{($.eventName = ConsoleLogin) && ($.errorMessage = "Failed authentication") }',
        metricTransformations=[
            {
                'metricName': metric_name,
                'metricNamespace': 'CISBenchmark',
                'metricValue': '1',
            },
        ]
    )

    cloudwatch = get_creds("cloudwatch", Id=account_id)

    cloudwatch.put_metric_alarm(
        AlarmName=metric_name,
        AlarmDescription='CIS Benchmark - 3.6 Ensure a log metric filter and alarm exist for console auth failures (Scored) (level 2)',
        AlarmActions=[
            topic_arn,
        ],
        MetricName=metric_name,
        Namespace='CISBenchmark',
        Statistic='Sum',
        Period=300,
        EvaluationPeriods=1,
        Threshold=1,
        ComparisonOperator='GreaterThanOrEqualToThreshold'
    )

def configure_log_3_7(account_id=None, region_name="us-east-2", topic_arn=None, 
    log_group_name="cis_disable_or_delete_cmk_changes_metric",
    filter_name="cis_disable_or_delete_cmk_changes_metric",
    metric_name="cis_disable_or_delete_cmk_changes_metric"):
    '''
    3.7 Ensure a log metric filter and alarm exist for disabling or scheduling deletion of KMS CMK (Scored) (level 2)
    '''
    if not topic_arn:
        raise Exception("Topic ARN does not exists")

    logs = get_creds("logs", Id=account_id)

    logs.put_metric_filter(
        logGroupName=log_group_name,
        filterName=filter_name,
        filterPattern='{($.eventSource = kms.amazonaws.com) && (($.eventName=DisableKey)||($.eventName=ScheduleKeyDeletion)) }',
        metricTransformations=[
            {
                'metricName': metric_name,
                'metricNamespace': 'CISBenchmark',
                'metricValue': '1',
            },
        ]
    )

    cloudwatch = get_creds("cloudwatch", Id=account_id)

    cloudwatch.put_metric_alarm(
        AlarmName=metric_name,
        AlarmDescription='CIS Benchmark - 3.7 Ensure a log metric filter and alarm exist for disabling or scheduling deletion of KMS CMK (Scored) (level 2)',
        AlarmActions=[
            topic_arn,
        ],
        MetricName=metric_name,
        Namespace='CISBenchmark',
        Statistic='Sum',
        Period=300,
        EvaluationPeriods=1,
        Threshold=1,
        ComparisonOperator='GreaterThanOrEqualToThreshold'
    )

def configure_log_3_8(account_id=None, region_name="us-east-2", topic_arn=None, 
    log_group_name="cis_s3_bucket_policy_changes_metric",
    filter_name="cis_s3_bucket_policy_changes_metric",
    metric_name="cis_s3_bucket_policy_changes_metric"):
    '''
    3.8 Ensure a log metric filter and alarm exist for S3 bucket policy changes (Scored) (level 1)
    '''
    if not topic_arn:
        raise Exception("Topic ARN does not exists")

    logs = get_creds("logs", Id=account_id)

    logs.put_metric_filter(
        logGroupName=log_group_name,
        filterName=filter_name,
        filterPattern='{($.eventSource = s3.amazonaws.com) && (($.eventName = PutBucketAcl) ||($.eventName = PutBucketPolicy) || ($.eventName = PutBucketCors) ||($.eventName = PutBucketLifecycle) || ($.eventName = PutBucketReplication) ||($.eventName = DeleteBucketPolicy) || ($.eventName = DeleteBucketCors) ||($.eventName = DeleteBucketLifecycle) || ($.eventName =DeleteBucketReplication)) }',
        metricTransformations=[
            {
                'metricName': metric_name,
                'metricNamespace': 'CISBenchmark',
                'metricValue': '1',
            },
        ]
    )

    cloudwatch = get_creds("cloudwatch", Id=account_id)

    cloudwatch.put_metric_alarm(
        AlarmName=metric_name,
        AlarmDescription='CIS Benchmark - 3.8 Ensure a log metric filter and alarm exist for S3 bucket policy changes (Scored) (level 1)',
        AlarmActions=[
            topic_arn,
        ],
        MetricName=metric_name,
        Namespace='CISBenchmark',
        Statistic='Sum',
        Period=300,
        EvaluationPeriods=1,
        Threshold=1,
        ComparisonOperator='GreaterThanOrEqualToThreshold'
    )

def configure_log_3_9(account_id=None, region_name="us-east-2", topic_arn=None, 
    log_group_name="cis_aws_config_changes_metric",
    filter_name="cis_aws_config_changes_metric",
    metric_name="cis_aws_config_changes_metric"):
    '''
    3.9 Ensure a log metric filter and alarm exist for for AWS Config configuration changes (Scored) (level 2)
    '''
    if not topic_arn:
        raise Exception("Topic ARN does not exists")

    logs = get_creds("logs", Id=account_id)

    logs.put_metric_filter(
        logGroupName=log_group_name,
        filterName=filter_name,
        filterPattern='{($.eventSource = config.amazonaws.com) && (($.eventName=StopConfigurationRecorder)||($.eventName=DeleteDeliveryChannel)||($.eventName=PutDeliveryChannel)||($.eventName=PutConfigurationRecorder))}',
        metricTransformations=[
            {
                'metricName': metric_name,
                'metricNamespace': 'CISBenchmark',
                'metricValue': '1',
            },
        ]
    )

    cloudwatch = get_creds("cloudwatch", Id=account_id)

    cloudwatch.put_metric_alarm(
        AlarmName=metric_name,
        AlarmDescription='CIS Benchmark - 3.9 Ensure a log metric filter and alarm exist for for AWS Config configuration changes (Scored) (level 2)',
        AlarmActions=[
            topic_arn,
        ],
        MetricName=metric_name,
        Namespace='CISBenchmark',
        Statistic='Sum',
        Period=300,
        EvaluationPeriods=1,
        Threshold=1,
        ComparisonOperator='GreaterThanOrEqualToThreshold'
    )

def configure_log_3_10(account_id=None, region_name="us-east-2", topic_arn=None, 
    log_group_name="cis_security_group_changes_metric",
    filter_name="cis_security_group_changes_metric",
    metric_name="cis_aws_config_changes_metric"):
    '''
    3.10 Ensure a log metric filter and alarm exist for security group changes (Scored) (level 2)
    '''
    if not topic_arn:
        raise Exception("Topic ARN does not exists")

    logs = get_creds("logs", Id=account_id)

    logs.put_metric_filter(
        logGroupName=log_group_name,
        filterName=filter_name,
        filterPattern='{($.eventName = AuthorizeSecurityGroupIngress) || ($.eventName =AuthorizeSecurityGroupEgress) || ($.eventName = RevokeSecurityGroupIngress)|| ($.eventName = RevokeSecurityGroupEgress) || ($.eventName =CreateSecurityGroup) || ($.eventName = DeleteSecurityGroup) }',
        metricTransformations=[
            {
                'metricName': metric_name,
                'metricNamespace': 'CISBenchmark',
                'metricValue': '1',
            },
        ]
    )

    cloudwatch = get_creds("cloudwatch", Id=account_id)

    cloudwatch.put_metric_alarm(
        AlarmName=metric_name,
        AlarmDescription='CIS Benchmark - 3.10 Ensure a log metric filter and alarm exist for security group changes (Scored) (level 2)',
        AlarmActions=[
            topic_arn,
        ],
        MetricName=metric_name,
        Namespace='CISBenchmark',
        Statistic='Sum',
        Period=300,
        EvaluationPeriods=1,
        Threshold=1,
        ComparisonOperator='GreaterThanOrEqualToThreshold'
    )

def configure_log_3_11(account_id=None, region_name="us-east-2", topic_arn=None, 
    log_group_name="cis_nacl_changes_metric",
    filter_name="cis_nacl_changes_metric",
    metric_name="cis_nacl_changes_metric"):
    '''
    3.11 Ensure a log metric filter and alarm exist for changes to Network Access Control Lists (NACL) (Scored) (level 2)
    '''
    if not topic_arn:
        raise Exception("Topic ARN does not exists")

    logs = get_creds("logs", Id=account_id)

    logs.put_metric_filter(
        logGroupName=log_group_name,
        filterName=filter_name,
        filterPattern='{ ($.eventName = CreateNetworkAcl) || ($.eventName = CreateNetworkAclEntry) || ($.eventName = DeleteNetworkAcl) || ($.eventName = DeleteNetworkAclEntry) || ($.eventName = ReplaceNetworkAclEntry) ||($.eventName = ReplaceNetworkAclAssociation) }',
        metricTransformations=[
            {
                'metricName': metric_name,
                'metricNamespace': 'CISBenchmark',
                'metricValue': '1',
            },
        ]
    )

    cloudwatch = get_creds("cloudwatch", Id=account_id)

    cloudwatch.put_metric_alarm(
        AlarmName=metric_name,
        AlarmDescription='CIS Benchmark - 3.11 Ensure a log metric filter and alarm exist for changes to Network Access Control Lists (NACL) (Scored) (level 2)',
        AlarmActions=[
            topic_arn,
        ],
        MetricName=metric_name,
        Namespace='CISBenchmark',
        Statistic='Sum',
        Period=300,
        EvaluationPeriods=1,
        Threshold=1,
        ComparisonOperator='GreaterThanOrEqualToThreshold'
    )

def configure_log_3_12(account_id=None, region_name="us-east-2", topic_arn=None, 
    log_group_name="cis_network_gw_changes_metric",
    filter_name="cis_network_gw_changes_metric",
    metric_name="cis_network_gw_changes_metric"):
    '''
    3.12 Ensure a log metric filter and alarm exist for changes to network gateways (Scored) (level 1)
    '''
    if not topic_arn:
        raise Exception("Topic ARN does not exists")

    logs = get_creds("logs", Id=account_id)

    logs.put_metric_filter(
        logGroupName=log_group_name,
        filterName=filter_name,
        filterPattern='{ ($.eventName = CreateCustomerGateway) || ($.eventName =DeleteCustomerGateway) || ($.eventName = AttachInternetGateway) ||($.eventName = CreateInternetGateway) || ($.eventName =DeleteInternetGateway) || ($.eventName = DetachInternetGateway) }',
        metricTransformations=[
            {
                'metricName': metric_name,
                'metricNamespace': 'CISBenchmark',
                'metricValue': '1',
            },
        ]
    )

    cloudwatch = get_creds("cloudwatch", Id=account_id)

    cloudwatch.put_metric_alarm(
        AlarmName=metric_name,
        AlarmDescription='CIS Benchmark - 3.12 Ensure a log metric filter and alarm exist for changes to network gateways (Scored) (level 1)',
        AlarmActions=[
            topic_arn,
        ],
        MetricName=metric_name,
        Namespace='CISBenchmark',
        Statistic='Sum',
        Period=300,
        EvaluationPeriods=1,
        Threshold=1,
        ComparisonOperator='GreaterThanOrEqualToThreshold'
    )

def configure_log_3_13(account_id=None, region_name="us-east-2", topic_arn=None, 
    log_group_name="cis_route_table_changes_metric",
    filter_name="cis_route_table_changes_metric",
    metric_name="cis_route_table_changes_metric"):
    '''
    3.13 Ensure a log metric filter and alarm exist for route table changes (Scored) (level 1)
    '''
    if not topic_arn:
        raise Exception("Topic ARN does not exists")

    logs = get_creds("logs", Id=account_id)

    logs.put_metric_filter(
        logGroupName=log_group_name,
        filterName=filter_name,
        filterPattern='{ ($.eventName = CreateRoute) || ($.eventName = CreateRouteTable) ||($.eventName = ReplaceRoute) || ($.eventName = ReplaceRouteTableAssociation)|| ($.eventName = DeleteRouteTable) || ($.eventName = DeleteRoute) ||($.eventName = DisassociateRouteTable) }',
        metricTransformations=[
            {
                'metricName': metric_name,
                'metricNamespace': 'CISBenchmark',
                'metricValue': '1',
            },
        ]
    )

    cloudwatch = get_creds("cloudwatch", Id=account_id)

    cloudwatch.put_metric_alarm(
        AlarmName=metric_name,
        AlarmDescription='CIS Benchmark - 3.13 Ensure a log metric filter and alarm exist for route table changes (Scored) (level 1)',
        AlarmActions=[
            topic_arn,
        ],
        MetricName=metric_name,
        Namespace='CISBenchmark',
        Statistic='Sum',
        Period=300,
        EvaluationPeriods=1,
        Threshold=1,
        ComparisonOperator='GreaterThanOrEqualToThreshold'
    )

def configure_log_3_14(account_id=None, region_name="us-east-2", topic_arn=None, 
    log_group_name="cis_vpc_changes_metric",
    filter_name="cis_vpc_changes_metric",
    metric_name="cis_vpc_changes_metric"):
    '''
    3.14 Ensure a log metric filter and alarm exist for VPC changes (Scored) (level 1)
    '''
    if not topic_arn:
        raise Exception("Topic ARN does not exists")

    logs = get_creds("logs", Id=account_id)

    logs.put_metric_filter(
        logGroupName=log_group_name,
        filterName=filter_name,
        filterPattern='{ ($.eventName = CreateVpc) || ($.eventName = DeleteVpc) ||($.eventName = ModifyVpcAttribute) || ($.eventName =AcceptVpcPeeringConnection) || ($.eventName = CreateVpcPeeringConnection) ||($.eventName = DeleteVpcPeeringConnection) || ($.eventName =RejectVpcPeeringConnection) || ($.eventName = AttachClassicLinkVpc) ||($.eventName = DetachClassicLinkVpc) || ($.eventName = DisableVpcClassicLink)|| ($.eventName = EnableVpcClassicLink) }',
        metricTransformations=[
            {
                'metricName': metric_name,
                'metricNamespace': 'CISBenchmark',
                'metricValue': '1',
            },
        ]
    )

    cloudwatch = get_creds("cloudwatch", Id=account_id)

    cloudwatch.put_metric_alarm(
        AlarmName=metric_name,
        AlarmDescription='CIS Benchmark - 3.13 Ensure a log metric filter and alarm exist for route table changes (Scored) (level 1)',
        AlarmActions=[
            topic_arn,
        ],
        MetricName=metric_name,
        Namespace='CISBenchmark',
        Statistic='Sum',
        Period=300,
        EvaluationPeriods=1,
        Threshold=1,
        ComparisonOperator='GreaterThanOrEqualToThreshold'
    )



def lambda_handler(event, context):


    response = create_sns_topic()

    topic_arn = response['topic_arn']

    configure_cloudtrail_2_4()
    configure_log_3_1(topic_arn=topic_arn)
    configure_log_3_2(topic_arn=topic_arn)
    configure_log_3_3(topic_arn=topic_arn)
    configure_log_3_4(topic_arn=topic_arn)
    configure_log_3_5(topic_arn=topic_arn)
    configure_log_3_6(topic_arn=topic_arn)
    configure_log_3_7(topic_arn=topic_arn)
    configure_log_3_8(topic_arn=topic_arn)
    configure_log_3_9(topic_arn=topic_arn)
    configure_log_3_10(topic_arn=topic_arn)
    configure_log_3_11(topic_arn=topic_arn)
    configure_log_3_12(topic_arn=topic_arn)
    configure_log_3_13(topic_arn=topic_arn)
    configure_log_3_14(topic_arn=topic_arn)
