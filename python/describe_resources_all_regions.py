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
#                ITERATES THROUGH AWS REGIONS EXECUTING ACTIONS               #
# ============================================================================#




# ============================================================================#
#          SETS VARIABLES ACCORDING TO RESOURCE TYPE IN INPUT MESSAGE         #
# ============================================================================#
def vars_by_resource(resource):
    if resource == "ec2":
        my_logging("Setting variables for ec2")
        response_item = "Reservations"
        resource_action = "describe_instances"
        token_name = "NextToken"
        sg_type = "GroupNames"

    elif resource == "rds":
        my_logging("Setting variables for rds")
        response_item = "DBInstances"
        resource_action = "describe_db_instances"
        token_name = "Marker"
        sg_type = "DBSecurityGroupName"
    
    return response_item, resource_action, token_name, sg_type

# ============================================================================#
#                      LISTS RESOURCES ON SELECTED REGION                     #
# ============================================================================#
def list_resources(service, Id, region):
    my_logging("Describing {} on region {}".format(service,region))
    try:
        client = get_creds(service,Id,region)
        return list_resources(client,response_item,resource_action,token_name)

    except botocore.exceptions.ClientError as e:
        my_logging("Could not list resources: {}".format(e),"error")
        return e

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





# ============================================================================#
# MAIN FUCTION #
# ============================================================================#

    global response_item
    global resource_action
    global token_name
    global sg_type
    response_item,resource_action,token_name,sg_type=vars_by_resource(my_event["resource"])

    # If report generated should only contain main info, removes the rest
    if my_event["report"] == "main":
        keys = keys_to_remove()

        if resource = "rds":
            for item in dasdasdas:
                remove_secondary_data(item,keys)
        elif resource = "ec2":
            for item in dasdasdas:
                for i in item:
                remove_secondary_data(i,keys)


# ============================================================================#
#  #
# ============================================================================#




# ============================================================================#
#  #
# ============================================================================#



# ============================================================================#
#  #
# ============================================================================#