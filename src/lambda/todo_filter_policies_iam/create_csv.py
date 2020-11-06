import csv
import json

file = "all.txt"
file_csv = "iam_billing.csv"
with open("iam_billing.csv", "w+", encoding="utf-8") as f:
    csv_writer = csv.writer(f, delimiter=',', lineterminator='\n', quoting=csv.QUOTE_ALL)
    csv_writer.writerow(["AccountId", "Email", "Tipo de Acesso", "Nome", "ARN Policy", "Permissões"])

with open(file) as f:
    content = json.loads(f.read())


def write_csv(account_id, email, typeof, name, permission, actions):
    with open(file_csv, "a+", encoding="utf-8") as f:
        csv_writer = csv.writer(f, delimiter=',', lineterminator='\n', quoting=csv.QUOTE_ALL)
        csv_writer.writerow([account_id, email, typeof, name, permission, actions])


for account in content:
    account_id = account['account']['id']
    email = account['account']['email']

    for user in account['Users']:
        username = user['UserName']
        for policy in user['Policies']:
            write_csv(account_id, email, "USER", username, policy, "??")

        for policy in user['PolicyBillingAttached']:
            if "Policy" in policy:
                write_csv(account_id, email, "USER", username, policy['Policy'], policy['Actions'])
            else:
                write_csv(account_id, email, "USER", username, policy, policy)
    
    for role in account['Roles']:
        rolename = role['RoleName']

        for role in role['Roles']:
            write_csv(account_id, email, "ROLE", rolename, role, "??")
        
        for policy in role['PolicyBillingAttached']:
            if "Policy" in policy:
                write_csv(account_id, email, "ROLE", rolename, policy['Policy'], policy['Actions'])
            else:
                write_csv(account_id, email, "ROLE", rolename, policy, policy)
    
    for group in account['Groups']:
        groupname = group['GroupName']

        for role in group['Roles']:
            write_csv(account_id, email, "ROLE", groupname, role, "??")
        
        for policy in group['PolicyBillingAttached']:
            if "Policy" in policy:
                write_csv(account_id, email, "GROUP", groupname, policy['Policy'], policy['Actions'])
            else:
                write_csv(account_id, email, "GROUP", groupname, policy, policy)
            