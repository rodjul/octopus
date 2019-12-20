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


    # policies = iam_cont.list_policies()
    # pegando as policies da role que queremos comparar
    role_compare = "accessmngt"
    role_child = iam_cont.list_attached_role_policies(role_compare)
    #print(role)
    
    # obtendo o arquivo master (json que contem as policies, roles)
    role_count_attached = len(role_child['AttachedPolicies'])
    
    lista_compliance = []

    for role in file_master['Roles']:
        # com a role que encontramos
        if role['Name'] == role_compare:
            # fazendo a contagem se há policies attachadas a mais
            count_policy = len(role['Policies'])
            count_arns   = len( role['PolicyArnAWS'] )
            master_count_attached = count_arns + count_policy
            print(master_count_attached, role_count_attached)
            
            policies_adicionais = []
            if master_count_attached != role_count_attached:
                policies_adicionais =  [policy['PolicyName'] for policy in role_child['AttachedPolicies']]

            # para cada policy da role, fazemos a comparacao de hash se a policy 
            # esta de acordo ou desatualizada, ou fora do padrão
            for policy_master in role['Policies']:
                
                for policy_child in role_child['AttachedPolicies']:
                    # print("policy_child:",policy_child)
                    if policy_child['PolicyName'] == policy_master:
                        
                        policy_ch = iam_cont.get_policy_document(policy_child['PolicyName'])
                        
                        if policy_ch == "Not found":
                            print("Nao encontrou")
                            break
                        
                        #pegando a policy do master
                        policy_doc_compare = ""
                        for policy_d in file_master['Policies']:
                            if policy_d['Name'] == policy_master:
                                policy_doc_compare = policy_d
                        
                        print(policy_ch)
                        print(policy_doc_compare)
                        
                        hash_master = hashlib.md5( str(policy_ch['PolicyVersion']['Document']).encode() ).hexdigest() 
                        hash_child  = hashlib.md5( str(policy_doc_compare['PolicyDocument']).encode() ).hexdigest() 
                        
                        policy_status = ""
                        if hash_master != hash_child:
                            #lista_compliance.append()
                            policy_status = "Não em compliance"
                        lista_compliance.append({"Name":role['Name'],"Policy":policy_child['PolicyName'], 
                                                "status":policy_status, "policies_adicionais":policies_adicionais })
                        
                
    
    
    
    return 200
   
    
    

    # Policies - Name, Description, Path, PolicyDocument
    # Roles  - Name, Policies[], PolicyArnAWS[] , TrustRelationship
    # TrustRelationships - Name, AssumeRolePolicyDocument



    pass