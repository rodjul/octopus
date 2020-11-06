import json
import time
import requests
from jose import jwk, jwt
from jose.utils import base64url_decode
from json import loads, dumps
from os import environ

# region = 'us-east-2'
# userpool_id = 'us-east-2_xE5rggUlY'
# app_client_id = '1qala15cec41prn04lnov0thka'
region = environ['REGION']
userpool_id = environ['USERPOOL_ID']
app_client_id = environ['APP_CLIENT_ID']
keys_url = 'https://cognito-idp.{}.amazonaws.com/{}/.well-known/jwks.json'.format(region, userpool_id)
response = requests.get(keys_url).json()
keys = response['keys']

def check_token(token):
    # get the kid from the headers prior to verification
    headers = jwt.get_unverified_headers(token)
    kid = headers['kid']
    # search for the kid in the downloaded public keys
    key_index = -1
    for i in range(len(keys)):
        if kid == keys[i]['kid']:
            key_index = i
            break
    if key_index == -1:
        print('Public key not found in jwks.json')
        return False, None
    # construct the public key
    public_key = jwk.construct(keys[key_index])
    # get the last two sections of the token,
    # message and signature (encoded in base64)
    message, encoded_signature = str(token).rsplit('.', 1)
    # decode the signature
    decoded_signature = base64url_decode(encoded_signature.encode('utf-8'))
    # verify the signature
    if not public_key.verify(message.encode("utf8"), decoded_signature):
        print('Signature verification failed')
        return False, None
    print('Signature successfully verified')
    # since we passed the verification, we can now safely
    # use the unverified claims
    claims = jwt.get_unverified_claims(token)
    # additionally we can verify the token expiration
    if time.time() > claims['exp']:
        print('Token is expired')
        return False, None
    # and the Audience  (use claims['client_id'] if verifying an access token)
    if claims['aud'] != app_client_id:
        print('Token was not issued for this audience')
        return False, None
    # now we can use the claims
    print(claims)
    #{'sub': 'c9724e0d-abb4-41f6-a6ea-9aee5f4ffbb6', 'aud': '1qala15cec41prn04lnov0thka', 'email_verified': False, 
    # 'event_id': '91254fa2-d57c-46f1-857c-eba01c2b3a8f', 'token_use': 'id', 'auth_time': 1579205415, 
    # 'iss': 'https://cognito-idp.us-east-2.amazonaws.com/us-east-2_xE5rggUlY', 
    # 'cognito:username': 'cognito-py-demo', 'exp': 1579209015, 'iat': 1579205415, 'email': 'cognito-py-demo@notmydomain.ro'}
    return True, claims['cognito:username']


#https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html
def generate_policy(principal_id, effect, resource, user_name):
    auth_response = {}
    auth_response['principalId'] = None

    if effect and resource:
        policyDocument = {}
        policyDocument['Version'] = '2012-10-17'
        policyDocument['Statement'] = []
        
        statementOne = {}
        statementOne['Action'] = "execute-api:Invoke"
        statementOne['Effect'] = effect
        statementOne['Resource'] = resource
        
        policyDocument['Statement'].append(statementOne)
        
        auth_response['policyDocument'] = policyDocument

    #/ Optional output with custom properties of the String, Number or Boolean type.
    auth_response['context'] = {"username": user_name}
    
    return auth_response



def lambda_handler(event, context):
    print("Debug: ",event)
    try:
        id_token = event['authorizationToken']
        authorized, username = check_token(id_token)
        if authorized:
            return generate_policy(None, "Allow", event['methodArn'], username)
        else:
            return generate_policy(None, "Deny", event['methodArn'], None)

        
    except Exception as e:
        raise e


