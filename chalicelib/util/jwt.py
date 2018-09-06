"""
pipenv run python chalicelib/util/jwt.py
From https://github.com/awslabs/aws-support-tools/blob/master/Cognito/decode-verify-jwt/decode-verify-jwt.py
"""
import requests
import json
import time
import os
from jose import jwk, jwt
from jose.exceptions import JWTError
from jose.utils import base64url_decode

region = 'us-east-1'
userpool_id = os.environ["USER_POOL_ID"]
app_client_id = os.environ["COGNITO_CLIENT_ID"]
keys_url = 'https://cognito-idp.{}.amazonaws.com/{}/.well-known/jwks.json'.format(region, userpool_id)
# instead of re-downloading the public keys every time
# we download them only on cold start
# https://aws.amazon.com/blogs/compute/container-reuse-in-lambda/
response = requests.get(keys_url)
keys = response.json().get('keys', [])

def get_claims(token, verify_audience=True):
    token = token
    # get the kid from the headers prior to verification
    try:
      headers = jwt.get_unverified_headers(token)
    except JWTError:
    #   print(f"JWT could not be decoded properly: {token}")
      return False
    kid = headers['kid']
    # search for the kid in the downloaded public keys
    key_index = -1
    for i in range(len(keys)):
        if kid == keys[i]['kid']:
            key_index = i
            break
    if key_index == -1:
        print('Public key not found in jwks.json');
        return False
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
        return False
    print('Signature successfully verified')
    # since we passed the verification, we can now safely
    # use the unverified claims
    claims = jwt.get_unverified_claims(token)
    # additionally we can verify the token expiration
    if time.time() > claims['exp']:
        print('Token is expired')
        return False
    # and the Audience  (use claims['client_id'] if verifying an access token)
    if verify_audience and claims['aud'] != app_client_id:
        print(f'Token was not issued for this audience: {claims["aud"]}')
        return False
    # now we can use the claims
    return claims