import boto3
from chalice import Response

cognito_idp_client = boto3.client("cognito-idp", "us-east-1")

def confirm_sign_up():
  from chalicelib.main import app, USER_POOL_ID, COGNITO_CLIENT_ID
  confirmation_code = app.current_request.query_params["code"]
  username = app.current_request.query_params["username"]
  user = cognito_idp_client.admin_get_user(
    UserPoolId=USER_POOL_ID,
    Username=username
  )
  redirect_url = "http://chinmayamission.com"
  for attribute in user["UserAttributes"]:
    if attribute["Name"] == "website":
      redirect_url = attribute["Value"]
  try:
    # Exceptions: https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_ConfirmSignUp.html
    cognito_idp_client.confirm_sign_up(
      ClientId=COGNITO_CLIENT_ID,
      Username=username,
      ConfirmationCode=confirmation_code
    )
  except Exception as e:
    return Response(
      status_code=200,
      body=f"<h1>An error occurred</h1><strong>Error:</strong> {e}<br><br>Please email us at <a href='mailto:itsupport.ccmt@chinmayamission.com'>itsupport.ccmt@chinmayamission.com</a> if you continue to experience errors.",
      headers={'Content-type': 'text/html'}
    )
  
  return Response(
      status_code=302,
      body='',
      headers={'Location': redirect_url})