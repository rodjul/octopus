import boto3
import botocore
from model.iam_control import IamControl
from os import environ
from json import loads, dumps
import hashlib
import datetime 

def get_file_master_compliance(file_key):
    s3 = boto3.resource('s3')
    try:
        obj = s3.Object(environ['octopus_resource'], file_key)
        return loads( obj.get()['Body'].read().decode('utf-8') )
    except botocore.exceptions.ClientError as e:
        print("Could not create account: {0}".format(e))
        return e


def save_to_s3(s3_key, content):
    '''
    :param s3_key: nome do arquivo
    :param content: conteudo do arquivo
    '''
    s3 = boto3.client('s3')
    kwargs = {
        #'ContentType':'text/plain; charset=utf-8',
        'Bucket': environ['octopus_resource'],
        'Key':  "compliance/"+s3_key,
        'Body': content,
        'ACL': 'private'
    }
    
    try:
        s3.put_object(**kwargs)
    except Exception as e:
        #print( e)
        raise e


def insert_data(account_id, account_name, data_json, date_action):
    '''
    Insert the name account create to make the index
    '''
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_account_compliance1")

    item = {"DateAction": date_action,
            "Account": account_id,
            "Name": account_name,
            "DataCompliance": dumps(data_json, ensure_ascii=False)}

    table.put_item( Item=item )

def check_compliance(event):
    try:
        # account_id = loads(event['body'])['AccountId']
        account_id  = event['AccountId']
        date_action = event['DateAction']
        account_name = event['AccountName']
    except KeyError:
        return 400

    file_key = "roles_policies_trusts.json"
    file_master = get_file_master_compliance(file_key)
    
    iam_cont = IamControl(account_id)
        
    # 1- comparar quantidade de policies atachadas 
    # 2- comparar com cada policy para ver o md5
    # 3- 

    
    lista_compliance = []

    for role_master in file_master['Roles']:
        roles_account = iam_cont.list_roles()
        role_compliance_found = False

        for role_account in roles_account['Roles']:

            # pegando as policies da role que queremos comparar
            role_compare = role_account['RoleName'] # "accessmngt"
            role_child = iam_cont.list_attached_role_policies(role_compare)
            #print(role)
            
            # obtendo o arquivo master (json que contem as policies, roles)
            role_count_attached = len(role_child['AttachedPolicies'])

            # com a role que encontramos
            if role_master['Name'] == role_compare:
                role_compliance_found = True

                # fazendo a contagem se há policies attachadas a mais
                policies_adicionais         = []
                policies_adicionais_status  = False
                master_count_attached       = len( role_master['PolicyArnAWS'] ) + len(role_master['Policies'])              
                
                if master_count_attached != role_count_attached:
                    policies_adicionais =  [policy['PolicyName'] for policy in role_child['AttachedPolicies']]
                    policies_adicionais_status = True

                # para cada policy da role, fazemos a comparacao de hash se a policy 
                # esta de acordo ou desatualizada
                for policy_master in role_master['Policies']:
                    
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
                            for policy_file in file_master['Policies']:
                                if policy_file['Name'] == policy_master:
                                    policy_master_content = policy_file
                            
                            # obtendo os hashes da policy master e child
                            hash_child = hash_master = ""
                            if policy_child_content != "":
                                hash_master = hashlib.md5( str(policy_child_content['PolicyVersion']['Document']).encode() ).hexdigest()
                            if policy_file != "": 
                                hash_child  = hashlib.md5( str(policy_master_content['PolicyDocument']).encode() ).hexdigest() 
                            
                            
                            if hash_master != hash_child or policies_adicionais_status:
                                lista_compliance.append({"name":role_master['Name'],"policy":policy_child['PolicyName'], "compliance":False,
                                                "status":"Policy com o nome informado não encontrado", "policies_adicionais":policies_adicionais })
                                
                            else:
                                lista_compliance.append({"name":role_master['Name'],"policy":policy_child['PolicyName'], "compliance":True,
                                                "status":"" })
               
                            # print(lista_compliance)
                    
                    # se nao encontrou a policy nessa role, adicionamos uma observacao
                    if not policy_child_found:
                        lista_compliance.append({"name":role_master['Name'],"policy":policy_master, "compliance":False,
                                                "status":"Policy com o nome informado não encontrado" })

        if not role_compliance_found:
            lista_compliance.append({"name":role_master['Name'],"policy":role_master['Policies'], "compliance":False,
                                    "status":"Não encontrado"})        
    
    print(lista_compliance)
    #s3_key = account_id +"_"+ datetime.datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
    #save_to_s3(s3_key, dumps(lista_compliance, ensure_ascii=False))
    insert_data(account_id, account_name, lista_compliance, date_action)

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
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_account_compliance1")
    date_actions = table.scan(AttributesToGet=["DateAction"])
    dates =  list( set( [date['DateAction'] for date in date_actions['Items']] ) )
    print(dates[0])
    # obter todos as datas e dps retornar no json as datas disponiveis
    # obter da data mais recente quando na 1 vez


def get_compliance(event):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table("octopus_account_compliance1")

    try:
        content = table.scan()['Items']
    except KeyError:
        content = ""

    return {"statusCode":200, "body":{"error":False, "content": content},
    "headers":{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*"}}

def lambda_handler(event, context):
    print("Debug:",event)
    
    if "Records" in event:
        for msg in event['Records']:
            event2 = {"AccountId": loads(msg['body'])['account_id'],
                     "DateAction": loads(msg['body'])['date_action'],
                     "AccountName": loads(msg['body'])['account_name']  }
            check_compliance(event2)
            
    elif "httpMethod" in event and event['httpMethod'] == "GET":
        return get_compliance(event)
