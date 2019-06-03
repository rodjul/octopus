from octopus import list_resources, get_creds
from json import loads,dumps
from os import environ
from ast import literal_eval

# Retrieves current list of regions on AWS
client = get_creds("ec2")
regions = client.describe_regions()
resources = []


def json_serial(msg):
    from datetime import datetime
    if isinstance(msg,datetime):
        return str(msg)


def lambda_handler(event,context):
    print("Event: {}".format(event))
    for record in event["Records"]:
        my_event = literal_eval(record["body"])
        print("Record: {}".format(my_event))
        # Prepare variables according with resource on event
        if my_event["resource"] == "ec2":
            print("Setting variables for ec2")
            service = "ec2"
            response_item = "Reservations"
            resource_action = "describe_instances"
            token_name = "NextToken"
            sg_type = "GroupNames"
        elif my_event["resource"] == "rds":
            print("Setting variables for rds")
            service = "rds"
            response_item = "DBInstances"
            resource_action = "describe_db_instances"
            token_name = "Marker"
            sg_type = "DBSecurityGroupName"

        # Iterates through each region describing its selected resources    
        for region in regions["Regions"]:

            print("Looking on region {}".format(region["RegionName"]))

            # Assumes boto3 client locally or on another account with cross account role
            client = get_creds(
                service,
                id=my_event["account"]["Id"],
                region=region["RegionName"]
            )

            # Access selected service (ec2 or rds) to describe its resources
            print("Describing compute-resources")
            response = list_resources(
                client,
                response_item,
                resource_action,
                token_name
            )
            print("Items retrivied: {}".format(response))
            
            # Iterates through each instance looking for its security-groups
            for item in response:
                print("Item: {}".format(item))
                for instance in item["Instances"]:
                    for sg in instance["SecurityGroups"]:
                        # Retrieves details about security groups
                        rules = list_resources(
                            client,
                            "SecurityGroups",
                            "describe_security_groups",
                            "NextToken"
                        )
                        for rule in rules:
                            rule.pop("GroupName",None)
                            rule.pop("GroupId",None)
                        # Adds retrieved data on dict
                        sg.update(
                            {
                                "Rules":rules
                            }
                        )

            # Adds response of each region to the resources list
            resources.extend(response)

        print("Resources found: {}".format(resources))
        
        # Sends resources found to s3 in json format
        s3_client = get_creds("s3")
        upload = s3_client.put_object(
            Body=dumps(resources, default=json_serial),
            Bucket=environ["bucket_name"],
            Key="{}-{}-{}.json".format(
                my_event["account"]["Id"],
                my_event["account"]["Email"],
                my_event["resource"]
            )
        )
        print("Upload: {}".format(upload))