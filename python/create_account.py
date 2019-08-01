import boto3
import botocore
from json import loads
from octopus import get_creds
from octopus import my_logging
from octopus import list_linked_accounts

# ============================================================================#
#                VALIDATES THAT ACCOUNT DOES NOT EXIST YET                    #
# ============================================================================#
def verify_account_exist(payer_id,role,email):
    accounts = list_linked_accounts(payer_id,role=role)
    my_logging("accounts on payer {}: {}".format(payer_id,accounts))

    for acc in loads(accounts):
        if acc["Email"] == email:
            return "Account already exists"
    
    return "ok"

# ============================================================================#
#               CREATES NEW ACCOUNT UNDER ROOT (PAYER) ACCOUNT                #
# ============================================================================#
def create_account(orgs_client,payer_id,role,email,name,payer_role):
    try:
        new_account = orgs_client.create_account(
            Email=email,
            AccountName=name,
            RoleName=payer_role,
            IamUserAccessToBilling="ALLOW"
        )
        my_logging("New Account {} creation: {}".format(email,new_account))
        return new_account
    except botocore.exceptions.ClientError as e:
        my_logging("Could not create account: {}".format(e),"error")
        return e

# ============================================================================#
#                         VERIFIES NEW ACCOUNT STATUS                         #
# ============================================================================#
def new_account_status(orgs_client,creat_id):
    account_status = orgs_client.describe_create_account_status(
        CreateAccountRequestId= create_id
    )
    my_logging(account_status)
    return account_status

# ============================================================================#
# CALLS FUNCTION ON ROOT ACCOUNT TO CREATE CROSSACCOUNTROLE ON LINKED ACCOUNT #
# ============================================================================#






# ============================================================================#
# ASSUMES NEW CROSS ACCOUNT ROLE AND DELETES OLD CROSS ROLE FROM ROOT ACCOUNT #
# ============================================================================#



# ============================================================================#
#             SENDS MESSAGE TO THE ACCOUNT SETUP CONTROLLER QUEUE             #
# ============================================================================#





# ============================================================================#
#                                 MAIN FUNCTION                               #
# ============================================================================#

orgs_client = get_creds("organizations",Id=payer_id,role="octopus_svc")

create_id = new_account["CreateAccountStatus"]["Id"]