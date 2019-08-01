from octopus import get_creds
from octopus import list_resources
from octopus import my_logging
from octopus import handle_event_trigger
from octopus import json_serial
from ast import literal_eval
from json import dumps
from datetime import datetime,date
from os import environ
import botocore

# ============================================================================#
#                LISTS ALL EXISTENT REGION ON AWS AT THE MOMENT               #
# ============================================================================#
def list_aws_regions():
    try:
        client = get_creds("ec2")
        return client.describe_regions()["Regions"]
    except botocore.exceptions.ClientError as e:
        my_logging("Could not list regions: {}".format(e),"error")
        return e

# ============================================================================#
#          SETS VARIABLES ACCORDING TO RESOURCE TYPE IN INPUT MESSAGE         #
# ============================================================================#
def vars_by_resource(resource):
    if resource == "ec2":
        my_logging("Setting variables for ec2")
        response_item = "Reservations"
        desc_action = "describe_instances"
        token_name = "NextToken"
        sg_type = "GroupNames"

    elif resource == "rds":
        my_logging("Setting variables for rds")
        response_item = "DBInstances"
        desc_action = "describe_db_instances"
        token_name = "Marker"
        sg_type = "DBSecurityGroupName"
    
    return response_item, desc_action, token_name, sg_type

# ============================================================================#
#                      LISTS RESOURCES ON SELECTED REGION                     #
# ============================================================================#
def describe_resources(service, acc_Id, Region, resp_item, action, token):

    my_logging("Describing {} on region {}".format(service,Region))
    try:
        client = get_creds(service,Id=acc_Id,region=Region)
        return list_resources(client,resp_item,action,token)

    except botocore.exceptions.ClientError as e:
        my_logging("Could not list resources: {}".format(e),"error")
        return e

# ============================================================================#
#               ITERATES THROUGH AWS REGIONS DESCRIBING RESOURCES             #
# ============================================================================#
def describe_through_regions(Id,regions,resource,resp_item,action,token):
    resources = {}
    for region in regions:
        my_logging(
            "Describing {} for region {}".format(resource,region)
        )

        region_resource = describe_resources(
            resource,
            Id,
            region["RegionName"],
            resp_item,
            action,
            token
        )

        resources[region["RegionName"]] = region_resource
    my_logging("Done! {} described in all regions".format(resource))
    return resources

# ============================================================================#
#              RETRIEVES LIST OF KEYS TO BE REMOVED ON RESOURCES              #
# ============================================================================#
def keys_to_remove():
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

# ============================================================================#
#             REMOVES SECONDARY INFO ABOUT RESOURCES WHEN DESIRED             #
# ============================================================================#
def remove_secondary_data(instances,keys):
    my_logging("Undesired Keys to remove whether are found: {}".format(keys))
    my_logging("Instances passed to the function: {}".format(instances))
    for instance in instances:
        for key in keys:
            instance.pop(key, None)
    
    my_logging("Instances after undesired keys removed: {}".format(instances))
    return instances

# ============================================================================#
#                GETS SECURITY GROUPS DETAILS FOR EACH REGION                 #
# ============================================================================#
def get_sg_details(acc_Id,Region):
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

# ============================================================================#
#                        SENDS ACCOUNT INVENTORY TO S3                        #
# ============================================================================#
def send_to_s3(bucket_name,file_name,file):
    try:
        client = get_creds("s3")
        return client.put_object(
            Body=file,
            Bucket=bucket_name,
            Key=file_name
        )
    except botocore.exceptions.ClientError as e:
        my_logging("Could not put object on s3: {}".format(e),"error")
        return e

# ============================================================================#
#                            GETS CURRENT DATETIME                            #
# ============================================================================#
def now():
    return datetime.now().strftime("%Y-%m-%d--%H-%M-%S")

# ============================================================================#
#                                 MAIN FUCTION                                #
# ============================================================================#
def main_function(event):
# EVENT SAMPLE
# {"resource":"ec2|rds","Id":"123456789012","report":"main|full"}

    # Retrives current regions on AWS
    regions = list_aws_regions()
    my_logging("Regions: {}".format(regions))

    # Sets variables according to which resource is going to be described
    # EC2 or RDS
    resp_item,desc_action,token_name,sg_type=vars_by_resource(event["resource"])

    # Loops through regions describing resources
    resources = describe_through_regions(
        event["Id"],
        regions,
        event["resource"],
        resp_item,
        desc_action,
        token_name
    )

    # If report generated should only contain main info, removes the rest
    if event["report"] == "main":
        keys = keys_to_remove()

        for region in resources.values():
            if event["resource"] == "rds":
                for item in region:
                    remove_secondary_data(item,keys)
            elif event["resource"] == "ec2":
                for item in region:
                    remove_secondary_data(item["Instances"],keys)

    # Get Security Groups created on regions
    my_logging("Retrieving Security groups from account")
    security_groups = {}
    for region in regions:
        security_groups[region["RegionName"]] = get_sg_details(
            event["Id"],region["RegionName"]
        )
        my_logging(
            "SGs for {}: {}".format(
                region,
                security_groups[region["RegionName"]]
            )
        )
    my_logging("Security Groups: {}".format(security_groups)) 

    # Saves data collected into a Json file on S3
    my_logging("Sending json to S3")
    file = {"Resources":resources,"SecGroups":security_groups}
    my_logging("File to be uploaded: {}".format(file))
    send = send_to_s3(
        environ["bucket_resources"],
        "{}/{}-{}.json".format(event["Id"],now(),event["resource"]),
        dumps(file, default=json_serial)
    )
    my_logging("file sent: {}".format(send))



# ============================================================================#
#                             GETS INITIAL INPUT                              #
# ============================================================================#
def lambda_handler(event,context):
    handle_event_trigger(event)