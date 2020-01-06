import boto3
import botocore
from model.iam_control import IamControl
from os import environ
from json import loads, dumps
import hashlib

def get_file_master_compliance(file_key):
    s3 = boto3.resource('s3')
    try:
        obj = s3.Object(environ['octopus_resource'], file_key)
        return loads( obj.get()['Body'].read().decode('utf-8') )
    except botocore.exceptions.ClientError as e:
        my_logging("Could not create account: {}".format(e),"error")
        return e


def lambda_handler(event, context):
    try:
        # account_id = loads(event['body'])['AccountId']
        account_id = event['AccountId']

    except KeyError:
        return 400

    file_key = "roles_policies_trusts.json"
    file_master = get_file_master_compliance(file_key)
    
    iam_cont = IamControl("826839167791")
        
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
    
    return 200
