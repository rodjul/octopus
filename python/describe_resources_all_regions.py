import boto3
from octopus import list_resources

client = boto3.client('ec2')

regions = client.describe_regions()

resources = []

def lambda_handler(event,context):
    for  region in regions['Regions']:
        client = boto3.client(
            event['service'],
            region_name=region['RegionName']
        )

        response = list_resources(
            client,
            event['resource'],
            event['resource_action'],
            event['token_name']
        )
        resources.extend(response)

    print(resources)
'''
event
{
    "service": "ec2",
    "resource": "Reservations",
    "resource_action": "describe_instances",
    "token_name": "NextToken"
}
{
    "service": "rds",
    "resource": "DBInstances",
    "resource_action": "describe_db_instances",
    "token_name": "Marker"
}
'''