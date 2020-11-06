import json
import time
import requests
from jose import jwk, jwt
from jose.utils import base64url_decode
from json import loads, dumps
from os import environ
import logging


def check_token_authorization(token):
    #https://login.microsoftonline.com/common/discovery/keys
    #https://login.microsoftonline.com/common/.well-known/openid-configuration
    
    app_client_id = environ['APP_CLIENT_ID']

    if "Bearer " in token:
        token = token.split("Bearer ")[1]
    # keys = requests.get("https://login.microsoftonline.com/common/discovery/keys").json()['keys']
    keys = requests.get(environ["SSO_KEYS"]).json()['keys']
    # get the kid from the headers prior to verification
    try:
        headers = jwt.get_unverified_headers(token)
    except Exception as e:
        logging.info(e)
        return False, None
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
    #bug - jwt cant find alg
    keys[key_index].update({"alg":headers['alg']})
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
    # print(claims)
    return True, {"unique_name":claims['unique_name'], "name":claims['name']}



#https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html
def generate_policy(principal_id, effect, resource, data):
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
    if data:
        username = data['unique_name']
        name = data['name']
        auth_response['context'] = {"username": username, "name":name}
    
    return auth_response

def lambda_handler(event, context):
    print("Debug: ",event)
    try:
        id_token = event['authorizationToken']
        authorized, data = check_token_authorization(id_token)
        if authorized:
            return generate_policy(None, "Allow", event['methodArn'], data)
        else:
            return generate_policy(None, "Deny", event['methodArn'], None)
    except Exception as e:
        raise e