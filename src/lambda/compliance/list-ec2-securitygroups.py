import json
import os
from datetime import datetime
import botocore
import boto3


'''
Find security groups that are in use, and show which of them can be excluded if not in use
'''


def get_creds(aws_service,**kwargs):
    if "Id" not in kwargs:
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


def list_aws_regions():
    # ============================================================================#
    #                LISTS ALL EXISTENT REGION ON AWS AT THE MOMENT               #
    # ============================================================================#
    try:
        client = get_creds("ec2")
        return client.describe_regions()["Regions"]
    except botocore.exceptions.ClientError as e:
        print("Could not list regions: {}".format(e),"error")
        return e


def find_security_group_vulnerable(response, security_groups):
    if response['Reservations']:
        # print(account, response)
        sgs_report = security_groups
        output = []
        for reservations in response['Reservations']:
            for instance in reservations['Instances']:
                try:
                    key_name = instance['KeyName']
                except:
                    key_name = ""
                # ipv4 = instance['PublicIpAddress']
                # print(security_groups)
                
                sgs = []

                for security_group_vulnerable in security_groups:
                    for security_group in instance['SecurityGroups']:
                        #print(security_group['GroupId'], security_group_vulnerable)
                        if security_group_vulnerable == security_group['GroupId']:
                            sgs.append(security_group_vulnerable)
                            sgs = list(set(sgs))
                if sgs:
                    name = ""
                    if "Tags" in instance:
                        for tag in instance['Tags']:
                            if tag['Key'] == "Name":
                                name = tag['Value']
                    output.append({
                        "instance":key_name, 
                        "sgs":sgs, 
                        "region": instance['Placement']['AvailabilityZone'],
                        "name": name
                    })
        
        # for row in output:
        #     sgs_inativo = []
        #     # print(row)
        #     for sg in row['sgs']:
        #         for sg_report in sgs_report:
        #             if sg_report != sg:
        #                 sgs_inativo.append(sg_report)
            
        #     row["sgs_inativos"]= sgs_inativo

        return output
    return {"sgs_inativos":security_groups}


def lambda_handler(event, context):
    '''
    CIS Security: 
    - 4.1 Ensure no security groups allow ingress from 0.0.0.0/0 to port 22 (Scored) (level 1)
    - 4.2 Ensure no security groups allow ingress from 0.0.0.0/0 to port 3389 (Scored) (level 1)
    - 4.3 Ensure the default security group of every VPC restricts all traffic (Scored) (level 2)

    accounts inputs
    [
        ["account_id", "security_group1,security_group2"]
    ]
    '''
    accounts = [
        ["0123456789","sg-aaaaa,sg-bbbbbb"],
    ]
    
    regions = list_aws_regions()
    for account in accounts:
        sg_ativo = []
        sg_inativo = sg_inativo = list(set( account[1].replace(" ","").split(",")  )) 
        
        for region in regions:
            ec2 = get_creds("ec2", Id=account[0], region=region["RegionName"])
            # instances = ec2.instances.filter(
            #     #Filters=[{'Name': 'instance-state-name', 'Values': ['running']}]
            #     )
            data = ec2.describe_instances(MaxResults=1000)
            if data['Reservations']:
                #print(account, response)
                report = find_security_group_vulnerable(data, sg_inativo)
    
                # print(account[0], report)
                sg_ativo.append(report)
        
        if sg_ativo:       
            for result in sg_ativo:
                for subresult in result:
                    # print(subresult)
                    for security in subresult['sgs']:
                        # print(security)
                        try:
                            sg_inativo.remove(security)
                        except:
                            pass

        print("Account: ",account[0])
        print("Sg sendo usados: ",sg_ativo)
        print("Sg que podem ser excluidos e não foram encontrados nas instancias:")
        print(sg_inativo)                
        
        print(" ")




    
    # TODO implement
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }