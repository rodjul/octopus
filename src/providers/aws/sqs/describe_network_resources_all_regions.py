from boto3 import resource
from model.octopus import get_creds
from model.octopus import list_resources
from model.octopus import my_logging
from model.octopus import json_serial
from ast import literal_eval
from json import dumps
import datetime
from dateutil.tz import tzlocal
from os import environ
import boto3
import botocore
import uuid


def list_aws_regions():
    # ============================================================================#
    #                LISTS ALL EXISTENT REGION ON AWS AT THE MOMENT               #
    # ============================================================================#
    try:
        client = get_creds("ec2")
        return client.describe_regions()["Regions"]
    except botocore.exceptions.ClientError as e:
        my_logging("Could not list regions: {}".format(e),"error")
        return e


def vars_by_resource(resource):
    # ============================================================================#
    #          SETS VARIABLES ACCORDING TO RESOURCE TYPE IN INPUT MESSAGE         #
    # ============================================================================#
    if resource == "ec2":
        my_logging("Setting variables for ec2")
        response_item = "Reservations"
        desc_action = "describe_instances"
        token_name = "NextToken"

    elif resource == "rds":
        my_logging("Setting variables for rds")
        response_item = "DBInstances"
        desc_action = "describe_db_instances"
        token_name = "Marker"
    
    return response_item, desc_action, token_name


def describe_resources(service, acc_Id, Region, resp_item, action, token):
    # ============================================================================#
    #                      LISTS RESOURCES ON SELECTED REGION                     #
    # ============================================================================#
    my_logging("Describing {} on region {}".format(service,Region))
    try:
        client = get_creds(service,Id=acc_Id,region=Region)
        return list_resources(client,resp_item,action,token)

    except botocore.exceptions.ClientError as e:
        my_logging("Could not list resources: {}".format(e),"error")
        return e
    except Exception as e:
        return [{"error":str(e)}]


def describe_through_regions(Id, regions, resource, resp_item, action, token):
    # ============================================================================#
    #               ITERATES THROUGH AWS REGIONS DESCRIBING RESOURCES             #
    # ============================================================================#
    resources = {}
    for region in regions:
        my_logging(
            "Describing {} for region {}".format(resource, region)
        )

        region_resource = describe_resources(
            resource,
            Id,
            region["RegionName"],
            resp_item,
            action,
            token
        )

        # transforming datetime.datetime to isoformat()
        for rg_resource in region_resource:
            if "Instances" in rg_resource:
                for instance in rg_resource['Instances']:
                    timestmp = instance['LaunchTime'].isoformat()
                    instance['LaunchTime'] = timestmp

        resources[region["RegionName"]] = region_resource
    my_logging("Done! {} described in all regions".format(resource))
    return resources


def keys_to_remove():
    # ============================================================================#
    #              RETRIEVES LIST OF KEYS TO BE REMOVED ON RESOURCES              #
    # ============================================================================#
    return [
        "KernelId","Monitoring","Placement","ProductCodes","RamdiskId",
        "StateTransitionReason","Architecture","BlockDeviceMappings",
        "ClientToken","EbsOptimized","EnaSupport","Hypervisor","InstanceLifecycle",
        "ElasticGpuAssociations","ElasticInferenceAcceleratorAssociations",
        "RootDeviceName","RootDeviceType","NetworkInterfaces","SourceDestCheck",
        "SpotInstanceRequestId","SriovNetSupport","StateReason",
        "VirtualizationType","CpuOptions","CapacityReservationSpecification",
        "CapacityReservationId","HibernationOptions","Licenses","AllocatedStorage",
        "PreferredBackupWindow","BackupRetentionPeriod","DBParameterGroups",
        "AvailabilityZone","DBSubnetGroup","PreferredMaintenanceWindow",
        "PendingModifiedValues","LatestRestorableTime","MultiAZ","EngineVersion",
        "AutoMinorVersionUpgrade","ReadReplicaSourceDBInstanceIdentifier",
        "ReadReplicaDBInstanceIdentifiers","ReadReplicaDBClusterIdentifiers",
        "LicenseModel","Iops","OptionGroupMemberships","CharacterSetName",
        "SecondaryAvailabilityZone","StatusInfos","StorageType","TdeCredentialArn",
        "DbInstancePort","DBClusterIdentifier","StorageEncrypted","KmsKeyId",
        "DbiResourceId","CACertificateIdentifier","DomainMemberships",
        "CopyTagsToSnapshot","MonitoringInterval","EnhancedMonitoringResourceArn",
        "MonitoringRoleArn","PromotionTier","DBInstanceArn","Timezone",
        "IAMDatabaseAuthenticationEnabled","PerformanceInsightsEnabled",
        "PerformanceInsightsKMSKeyId","PerformanceInsightsRetentionPeriod",
        "EnabledCloudwatchLogsExports","ProcessorFeatures","DeletionProtection",
        "AssociatedRoles","ListenerEndpoint","AmiLaunchIndex",]


def remove_secondary_data(instances,keys):
    # ============================================================================#
    #             REMOVES SECONDARY INFO ABOUT RESOURCES WHEN DESIRED             #
    # ============================================================================#
    my_logging("Undesired Keys to remove whether are found: {}".format(keys))
    my_logging("Instances passed to the function: {}".format(instances))
    for instance in instances:
        for key in keys:
            if key in instance:
                instance.pop(key, None)
    
    my_logging("Instances after undesired keys removed: {}".format(instances))
    return instances


def get_sg_details(acc_Id,Region):
    # ============================================================================#
    #                GETS SECURITY GROUPS DETAILS FOR EACH REGION                 #
    # ============================================================================#
    try:
        client = get_creds("ec2",Id=acc_Id,region=Region)
        return list_resources(
            client,
            "SecurityGroups",
            "describe_security_groups",
            "NextToken"
        )
    except botocore.exceptions.ClientError as e:
        my_logging("Could not get security groups: {}".format(e),"error")
        return e



def save_data(timestamp, account_id, email, type_request, resources, security_groups):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_aws_network_details_linked_accounts")

    item = {
        # "UUID": timestamp + "-" + type_request,
        "UUID": str(uuid.uuid4()),
        "AccountId": account_id,
        "Timestamp": timestamp,
        "Email": email,
        "TypeRequest": type_request,
        "Resources": resources,
        "SecurityGroup": security_groups
    }

    table.put_item( Item=item )
    

def main_function(event):
    # ============================================================================#
    #                                 MAIN FUCTION                                #
    # ============================================================================#
    # EVENT SAMPLE
    # {"resource":"ec2|rds","Id":"123456789012","report":"main|full"}
    # {"account_id": account['Id'], "email_account":account['Email'], "date_action": date_action,"resource": resource,"report": "main",}

    timestamp = event['date_action']
    account_id = event['account_id']
    email =  event['email_account']
    type_request = event['resource'] #ec2 || rds
    report = event['report']

    # Retrives current regions on AWS
    regions = list_aws_regions()
    # my_logging("Regions: {}".format(regions))

    # Sets variables according to which resource is going to be described
    # EC2 or RDS
    resp_item,desc_action,token_name = vars_by_resource(type_request)

    # Loops through regions describing resources
    resources = describe_through_regions(
        account_id,
        regions,
        type_request,
        resp_item,
        desc_action,
        token_name
    )

    # If report generated should only contain main info, removes the rest
    if report == "main":
        keys = keys_to_remove()

        for region in resources.values():
            if type_request == "rds":
                for item in region:
                    print("RDS: ",item, keys, resources, region)
                    remove_secondary_data(item,keys)
            elif type_request == "ec2":
                for item in region:
                    print("EC2: ",item, keys, resources, region)
                    if "Instances" in item:
                        remove_secondary_data(item["Instances"],keys)
                    else:
                        remove_secondary_data(item,keys)

    # Get Security Groups created on regions
    # my_logging("Retrieving Security groups from account")
    security_groups = {}
    for region in regions:
        try:
            security_groups[region["RegionName"]] = get_sg_details(
                account_id,region["RegionName"]
            )
        except Exception as e:
            print(e)
            security_groups[region["RegionName"]] = [{"error": str(e)}]
        # my_logging(
        #     "SGs for {}: {}".format(
        #         region,
        #         security_groups[region["RegionName"]]
        #     )
        # )
    # my_logging("Security Groups: {}".format(security_groups)) 

    # Saves data collected into a Json file on S3
    # my_logging("Sending json to S3")
    file = {"Resources":resources,"SecGroups":security_groups}
    my_logging("File to be uploaded: {}".format(file))

    save_data(timestamp, account_id, email, type_request, resources, security_groups)



# ============================================================================#
#                             GETS INITIAL INPUT                              #
# ============================================================================#
def lambda_handler(event,context):
    # my_logging("Event Received on Lambda Trigger: {}".format(event))
    # Verifies if the event has more then 1 message in payload

    # This happens with multiple SQS messages in batch jobs
    if "Records" in event:
        my_logging("{} messages for batch job".format(len(event["Records"])))
        for record in event["Records"]:
            my_logging("Working on message: {}".format(record))
            main_function(literal_eval(record["body"]))

    # This happens when function is triggered directly by another lambda or api
    else:
        # my_logging("Single message in event. Trigger directly by api request")
        my_logging("Working on message: {}".format(event))
        main_function(event)