import boto3
import botocore
from octopus import get_creds
from octopus import my_logging

# ============================================================================#
#                VALIDATES THAT ACCOUNT DOES NOT EXIST YET                    #
# ============================================================================#
def verify_account_exist(payer_id,role):
    orgs_client = get_creds("organizations",Id=payer_id,role=role)
    


# ============================================================================#
#               CREATES NEW ACCOUNT UNDER ROOT (PAYER) ACCOUNT                #
# ============================================================================#
def create_account(payer_id,role,email,name,payer_role):
    try:
        orgs_client = get_creds("organizations",Id=payer_id,role=role)
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