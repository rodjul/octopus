from os import environ,popen
from json import loads, dumps
import octopus
import botocore

'''
Description: Adds in the specified bucket the policy to allow the account that we are creating the trail to store logs in the bucket.
             It updates the policy of the bucket and after creates the trail.
Event: {"Id":"0123465789"}
'''


acc_id_trail = environ['id_cloudtrail'] #461835337376
bucket_cloudtrail = environ['bucket_cloudtail']
name_trail = environ['name_cloudtrail']


def update_policy_bucket(acc_id_new):
    #assume role in cloudtrail account
    s3_client_sts = octopus.get_creds("s3",Id=acc_id_trail)
    
    bucket_empty = False
    try:
        #getting the bucket policy
        bucket_policy = s3_client_sts.get_bucket_policy(Bucket=bucket_cloudtrail)
        account_arns = loads(bucket_policy['Policy'])['Statement'][1]['Resource']
    except botocore.exceptions.ClientError as e:
        if "NoSuchBucketPolicy" in str(e):
            #there is no policy in the bucket, we need to create then
            bucket_empty = True
            
    
    account_arn = 'arn:aws:s3:::%s/AWSLogs/%s/*' % (bucket_cloudtrail,acc_id_new)
    if bucket_empty:
        account_arns = account_arn
        
    
    if bucket_empty or account_arn not in account_arns:
        
        if not bucket_empty:
            #if the bucket policy is not empty, we add in the list and sort it
            try:
                account_arns.append(account_arn)
            except AttributeError:
                #when occur this error is because there is only one element in the resource and it is classified as str
                #so we need to convert to list to add multiples accounts
                account_arns = account_arns.split()
                account_arns.append(account_arn)
            
            account_arns = sorted(account_arns, reverse=True)
        #print(account_arns)
        
        #we neeed to use the policy from bucket to update with the new account added
        
        new_bucket_policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "AWSCloudTrailAclCheck20150319",
                "Effect": "Allow",
                "Principal": {
                    "Service": "cloudtrail.amazonaws.com"
                },
                "Action": "s3:GetBucketAcl",
                "Resource": "arn:aws:s3:::rodrigo-teste-bucket-1"
            },
            {
                "Sid": "AWSCloudTrailWrite20150319",
                "Effect": "Allow",
                "Principal": {
                    "Service": "cloudtrail.amazonaws.com"
                },
                "Action": "s3:PutObject",
                "Resource": account_arns,
                "Condition": {
                    "StringEquals": {
                        "s3:x-amz-acl": "bucket-owner-full-control"
                    }
                }
            }
        ]}
        

        s3_client_sts.put_bucket_policy(Bucket=bucket_cloudtrail,
                                        Policy=dumps(new_bucket_policy))


def create_trail():
    #creating cloudtrail in the new account
    cloudtrail_client = octopus.get_creds('cloudtrail')
    
    try:
        #creating trail
        cloudtrail_response = cloudtrail_client.create_trail(
                                        Name=name_trail,
                                        S3BucketName=bucket_cloudtrail,
                                        IsMultiRegionTrail=True
                                    )
        print("Success: ",cloudtrail_response['TrailARN'])
        
        try:
            #after created, we need to call another function to start logging the trail
            cloudtrail_client.start_logging(Name=cloudtrail_response['Name'] )
        except Exception as e:
            print("Error in start to logging. ERROR:",e)
            
    except Exception as e:
        print("Error in creating. ERROR:",e)


def lambda_handler(event, context):
    acc_id_new = event['Id'] #the var that we received when creating a new account 
    
    update_policy_bucket(acc_id_new)
    
    create_trail()