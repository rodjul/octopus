import boto3
import botocore
from model.iam_control import IamControl
from os import environ
from json import loads, dumps
import hashlib
import datetime 
from boto3.dynamodb.conditions import Attr


def insert_data(account_id, account_name, data_json, date_action, type_role):
    '''
    Insert the name account create to make the index
    '''
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_account_compliance")

    item = {
        "DateAction": date_action+"-IAM",
        "Account": account_id,
        "Name": account_name,
        "DataCompliance": dumps(data_json, ensure_ascii=False),
        "TypeRole": type_role,
        "TypeCompliance":"IAM"
        }

    table.put_item( Item=item )

def check_compliance(event):
    try:
        # account_id = loads(event['body'])['AccountId']
        account_id  = event['AccountId']
        date_action = event['DateAction']
        account_name = event['AccountName']
        type_role = event['TypeRole']
    except KeyError:
        return 400

    iam = IamControl(None, do_sts=False)
    file_master = iam.get_document_of_roles(type_role)
    
    iam_cont = IamControl(account_id)
    
    lista_compliance = []
    
    # obtendo os valores do banco (master) IAM Role (role name, policy name, trust relationship)
    for role_master in file_master['roles_json']:
        try:
            roles_account = iam_cont.list_roles()
        except Exception as e:
            print("Não conseguiu fazer sts:", e, account_id)
            lista_compliance = [{"name":"n/a","policy":"n/a", "compliance":False,
                                "status":"Não foi possível fazer o acesso a conta"}]
            insert_data(account_id, account_name, lista_compliance, date_action, type_role)
            return 200

        role_compliance_found = False

        # obtendo os valores de IAM Role da conta filha
        for role_account in roles_account['Roles']:

            # pegando as policies da role que queremos comparar
            role_compare = role_account['RoleName'] # "accessmngt"
            role_child = iam_cont.list_attached_role_policies(role_compare)
            #print(role)
            
            # se encontrarmos a role na conta filha
            if role_master['role_name'] == role_compare:
                role_compliance_found = True

                # fazendo a contagem se há policies attachadas a mais
                policies_adicionais         = []
                policies_adicionais_status  = False
                # obtendo a quantidade de roles attached
                role_count_attached         = len( role_child['AttachedPolicies'] )
                master_count_attached       = len( role_master['policy_arn_aws'] ) + len(role_master['policies'])              
                
                if master_count_attached != role_count_attached:
                    policies_adicionais =  [policy['PolicyName'] for policy in role_child['AttachedPolicies']]
                    policies_adicionais_status = True

                # para cada policy da role, fazemos a comparacao de hash se a policy 
                # esta de acordo ou desatualizada
                for policy_master in role_master['policies']:

                    policy_child_found = False
                    for policy_child in role_child['AttachedPolicies']:
                        
                        if policy_child['PolicyName'] == policy_master:
                            policy_child_found = True

                            policy_child_content = iam_cont.get_policy_document(policy_child['PolicyName'])
                            
                            if policy_child_content == "Not found":
                                print("Nao encontrou")
                                #break
                                policy_child_content = ""
                            
                            #pegando a policy do master
                            policy_master_content = ""
                            for policy_file in file_master['policy_json']:
                                policy_file = loads(policy_file['Data'])

                                if policy_file['Name'] == policy_master:
                                    policy_master_content = policy_file
                            
                            # obtendo os hashes da policy master e child
                            hash_child = hash_master = ""
                            if policy_child_content != "":
                                hash_master = hashlib.md5( str(policy_child_content['PolicyVersion']['Document']).encode() ).hexdigest()
                            if policy_master_content != "": 
                                hash_child  = hashlib.md5( str(policy_master_content['PolicyDocument']).encode() ).hexdigest() 
                            
                            
                            if hash_master != hash_child or policies_adicionais_status:
                                lista_compliance.append({"name":role_master['role_name'],"policy":policy_child['PolicyName'], "compliance":False,
                                                "status":"Policy possui modificações e/ou policy adicionais", "policies_adicionais":policies_adicionais })
                                
                            else:
                                lista_compliance.append({"name":role_master['role_name'],"policy":policy_child['PolicyName'], "compliance":True,
                                                "status":"" })
               
                            # print(lista_compliance)
                    
                    # se nao encontrou a policy nessa role, adicionamos uma observacao
                    if not policy_child_found:
                        lista_compliance.append({"name":role_master['role_name'],"policy":policy_master, "compliance":False,
                                                "status":"Policy com o nome informado não encontrado" })

        if not role_compliance_found:
            lista_compliance.append({"name":role_master['role_name'],"policy":role_master['policies'], "compliance":False,
                                    "status":"Não encontrado"})        
    
    print(lista_compliance)

    insert_data(account_id, account_name, lista_compliance, date_action, type_role)

    return 200


def get_compliance_by_account(event):
    try:
        account_id = event['pathParameters']['account_id'] 
    except IndexError:
        return {"statusCode":400, "body":{"error":True, "message":"Key error param"}}
    
    s3 = boto3.client("s3")
    
    contents = s3.list_objects(
        Bucket=environ['octopus_resource'],
        Prefix="compliance/"+account_id
    )
    
    if "Contents" in contents and contents['Contents']:
        last = len(contents['Contents']) -1 
        last_key = contents['Contents'][last]['Key'] 
        content =  s3.get_object(Bucket=environ['octopus_resource'], Key=last_key)['Body'].read().decode()
        
        return {"statusCode":200, "body":dumps({"found":True, "message":content}, ensure_ascii=False),
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
        
    return {"statusCode":200, "body":dumps({"found":False, "message":"Not found"}), 
        "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    

def get_date_actions():
    # obter todos as datas e dps retornar no json as datas disponiveis
    # obter da data mais recente quando na 1 vez
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_account_compliance")
    response = table.scan(FilterExpression=Attr("TypeCompliance").eq("IAM"))
    dates = []
    
    while 'LastEvaluatedKey' in response:
        for item in response['Items']:
            dates.append(item['DateAction'].split("-")[0])
        response = table.scan(FilterExpression=Attr("TypeCompliance").eq("IAM"),
                            ExclusiveStartKey=response['LastEvaluatedKey'])
    dates = list(set(dates))
    dates.sort()
    return dates


def get_compliance(event):
    try:
        date_input = event['queryStringParameters']['date_action']
        type_role = event['queryStringParameters']['type_role']
    except KeyError as e:
        print("Error in get param: ",e)
        return {"statusCode":400, "body":dumps({"error":True, "message":"Params invalid"}),
    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
        
    
    dates = get_date_actions()
    # if the value is null, get the lastest date available
    if date_input == "":
        try:
            date_input = dates[len(dates)-1]
        except IndexError:
            date_input = ""
    
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_account_compliance")
    
    content = ""
    if date_input != "":
        try:
            # content = table.scan(FilterExpression=Attr("DateAction").eq(date_input) 
            response = table.scan(FilterExpression=Attr("TypeRole").eq(type_role)
                                & Attr("TypeCompliance").eq("IAM"))
            temp = []
            while 'LastEvaluatedKey' in response:
                for row in response['Items']:
                    if row['DateAction'].split("-")[0] == date_input:
                        row['DateAction'] = row['DateAction'].split("-")[0]
                        temp.append(row)

                response = table.scan(FilterExpression=Attr("TypeRole").eq(type_role)
                                & Attr("TypeCompliance").eq("IAM"))
            
            content = temp
        except KeyError as e:
            print(e)
            content = ""
    
    return {"statusCode":200, "body":dumps({"error":False, "dates_available":dates, "content": content}),
    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

def lambda_handler(event, context):
    print("Debug:",event)
    
    if "Records" in event:
        for msg in event['Records']:
            event2 = {"AccountId": loads(msg['body'])['account_id'],
                     "DateAction": loads(msg['body'])['date_action'],
                     "AccountName": loads(msg['body'])['account_name'],  
                     "TypeRole": loads(msg['body'])['type_role']  }
            check_compliance(event2)
            
    elif event['httpMethod'] == "GET":
        if event['resource'] == "/policy/compliance/iam/dates-available":
            dates = dates = get_date_actions()
            return {"statusCode":200, "body":dumps({"error":False, "dates_available":dates}),
    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}
    
        elif event['resource'] == "/policy/compliance/check":
            return get_compliance(event)
        
