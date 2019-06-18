# from octopus import list_resources, get_creds
# from json import loads,dumps
# from os import environ
# from ast import literal_eval

# # Retrieves current list of regions on AWS
# client = get_creds("ec2")
# regions = client.describe_regions()
# resources = []


# def json_serial(msg):
#     from datetime import datetime
#     if isinstance(msg,datetime):
#         return str(msg)


# def lambda_handler(event,context):
#     print("Event: {}".format(event))
#     for record in event["Records"]:
#         my_event = literal_eval(record["body"])
#         print("Record: {}".format(my_event))
#         # Prepare variables according with resource on event
#         if my_event["resource"] == "ec2":
#             print("Setting variables for ec2")
#             service = "ec2"
#             response_item = "Reservations"
#             resource_action = "describe_instances"
#             token_name = "NextToken"
#             sg_type = "GroupNames"
#         elif my_event["resource"] == "rds":
#             print("Setting variables for rds")
#             service = "rds"
#             response_item = "DBInstances"
#             resource_action = "describe_db_instances"
#             token_name = "Marker"
#             sg_type = "DBSecurityGroupName"

#         # Iterates through each region describing its selected resources    
#         for region in regions["Regions"]:

#             print("Looking on region {}".format(region["RegionName"]))

#             # Assumes boto3 client locally or on another account with cross account role
#             client = get_creds(
#                 service,
#                 id=my_event["account"]["Id"],
#                 region=region["RegionName"]
#             )

#             # Access selected service (ec2 or rds) to describe its resources
#             print("Describing compute-resources")
#             response = list_resources(
#                 client,
#                 response_item,
#                 resource_action,
#                 token_name
#             )
#             print("Items retrivied: {}".format(response))
            
#             # Iterates through each instance looking for its security-groups
#             for item in response:
#                 print("Item: {}".format(item))
#                 for instance in item["Instances"]:
#                     for sg in instance["SecurityGroups"]:
#                         # Retrieves details about security groups
#                         rules = list_resources(
#                             client,
#                             "SecurityGroups",
#                             "describe_security_groups",
#                             "NextToken"
#                         )
#                         for rule in rules:
#                             rule.pop("GroupName",None)
#                             rule.pop("GroupId",None)
#                         # Adds retrieved data on dict
#                         sg.update(
#                             {
#                                 "Rules":rules
#                             }
#                         )

#             # Adds response of each region to the resources list
#             resources.extend(response)

#         print("Resources found: {}".format(resources))
        
#         # Sends resources found to s3 in json format
#         s3_client = get_creds("s3")
#         upload = s3_client.put_object(
#             Body=dumps(resources, default=json_serial),
#             Bucket=environ["bucket_name"],
#             Key="{}-{}-{}.json".format(
#                 my_event["account"]["Id"],
#                 my_event["account"]["Email"],
#                 my_event["resource"]
#             )
#         )
#         print("Upload: {}".format(upload))



from octopus import get_creds
from octopus import list_resources
from ast import literal_eval
from json import dumps
from datetime import datetime



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
def describe_resources(service, Id, region, resp_item, action, token):

    my_logging("Describing {} on region {}".format(service,region))
    try:
        client = get_creds(service,Id,region)
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
            region,
            resp_item,
            action,
            token
        )

        resources[region] = region_resource
    my_logging("Done! {} described in all regions".format(event["resource"]))
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
        "AssociatedRoles","ListenerEndpoint"]

# ============================================================================#
#             REMOVES SECONDARY INFO ABOUT RESOURCES WHEN DESIRED             #
# ============================================================================#
def remove_secondary_data(instances,keys):
    my_logging("Undesired Keys to remove whether are found: {}".format(keys))
    for instance in instances:
        for key in keys:
            instance.pop(key, None)
    
    my_logging("Instances after undesired keys removed: {}".format(instances))
    return instances

# ============================================================================#
#                GETS SECURITY GROUPS DETAILS FOR EACH REGION                 #
# ============================================================================#
def get_sg_details(Id,region):
    try:
        client = get_creds("ec2",Id,region)
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
            if event["resource"] = "rds":
                for item in region:
                    remove_secondary_data(item,keys)
            elif event["resource"] = "ec2":
                for item in region:
                    for i in item["Instances"]:
                        remove_secondary_data(i,keys)

    # Get Security Groups created on regions
    my_logging("Retrieving Security groups from account")
    security_groups = {}
    for region in regions:
        security_groups[region] = get_sg_details(event["Id"],region)
        my_logging("SGs for {}: {}".format(region,security_groups[region]))
    my_logging("Security Groups: {}".format(security_groups)) 

    # Saves data collected into a Json file on S3
    my_logging("Sending json to S3")
    file = {"Resources":resources,"SecGroups":security_groups}
    my_logging("File to be uploaded: {}".format(file))
    send = send_to_s3(
        environ["bucket_resources"],
        "{}/{}-{}.json".format(event["Id"],now(),event["resource"]),
        dumps(file)
    my_logging("file sent: {}".format(send))

# ============================================================================#
#         HANDLES TRIGGER EVENT WHETHER IS SINGLE MESSAGE OR BATCH JOB        #
# ============================================================================#
def handle_event_trigger(event):
    my_logging("Event Received on Lambda Trigger: {}".format(event))
    # Verifies if the event has more then 1 message in payload

    # This happens with multiple SQS messages in batch jobs
    if "Records" in event:
        my_logging("{} messages for batch job".format(len(event["Records"])))
        for record in event["Records"]:
            my_logging("Working on message: {}".format(record))
            main_function(literal_eval(record["body"]))

    # This happens when function is triggered directly by another lambda or api
    else:
        my_logging("Single message in event. Trigger directly by api request")
        my_logging("Working on message: {}".format(event))
        main_function(event)


# ============================================================================#
#  #
# ============================================================================#



# ============================================================================#
#  #
# ============================================================================#