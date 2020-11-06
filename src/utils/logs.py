import boto3
from datetime import date, datetime
from json import loads, dumps
import uuid


def write(event_lambda : dict, system: str, status_code: int, payload: str, title: str, description: str ) -> None:
    '''
    Register a log based in event
    Parameters:
    event_lambda (dict): The event dict of the main lambda handler when it's triggered
    system (str): AWS, GCP, or OCTOPUS
    status_code (int): HTTP STATUS CODE of action
    payload (str): The content of payload form
    title (str): the title log
    description (str): the description of log
    '''

    username_jwt = event_lambda.get('requestContext').get('authorizer').get('username')
    name_jwt = event_lambda.get('requestContext').get('authorizer').get('name')
    resourcePath = event_lambda.get('requestContext').get('resourcePath')
    httpMethod = event_lambda.get('requestContext').get('httpMethod')
    sourceIp = event_lambda.get('requestContext').get('identity').get('sourceIp')
    userAgent = event_lambda.get('requestContext').get('identity').get('userAgent')

    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_event_action_log")
    item = {
        # "UUID": str(uuid.uuid4()),
        "TimestampUTC": datetime.utcnow().isoformat(),
        "SystemType": system.upper(),
        "Username": username_jwt,
        "Name": name_jwt,
        "ResourcePath": resourcePath,
        "HttpMethod": httpMethod,
        "SourceIp": sourceIp,
        "UserAgent": userAgent,
        "StatusCode": status_code,
        "Payload": payload,
        "Title" : title,
        "Description": description,
    }

    table.put_item( Item=item )
