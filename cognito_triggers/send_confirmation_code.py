import os

"""Sample event["response"]:

{"userAttributes": {"sub": "d5267ee4-3563-4e8b-b4f7-8af4929fc9e8", "website": "https://forms.beta.chinmayamission.com/admin/", "cognito:email_alias": "dxftsc+2ots8kjmm@sharklasers.com", "email_verified": "false", "cognito:user_status": "UNCONFIRMED", "name": "User", "email": "dxftsc+2ots8kjmm@sharklasers.com"}, "codeParameter": "941468", "linkParameter": "{##Click Here##}", "usernameParameter": null} 

"""

def lambda_handler(event, context):
  if event["userPoolId"] != os.environ["USER_POOL_ID"] or event["triggerSource"] != "CustomMessage_SignUp":
    return event
  if event["callerContext"]["clientId"]==os.environ["CHINMAYA_ECHOES_CLIENT_ID"]:
      code = event["request"]["codeParameter"]
      username = event["request"]["userAttributes"]["sub"]
      
      event["response"]["emailSubject"] = "Chinmaya Mission Account - Please verify your account";
      event["response"]["smsMessage"] = f"Welcome to the service. Your confirmation code is {code}";
      event["response"]["emailMessage"] = f"""
          Hari OM,<br>
          Your verification code for ChinmayaEchoes is {code}<br>
          Thanks,<br>
          Chinmaya Mission IT Team
          """
      return event
  else:
      code = event["request"]["codeParameter"]
      username = event["request"]["userAttributes"]["sub"]
      url = os.environ["API_ENDPOINT"]
      link = f"{url}confirmSignUp?code={code}&username={username}"
      
      event["response"]["emailSubject"] = "Chinmaya Mission Account - Please verify your account";
      event["response"]["smsMessage"] = f"Welcome to the service. Your confirmation code is {code}";
      event["response"]["emailMessage"] = f"""
      Hari OM,<br>
      Please click on the link below to verify your email address.<br><br>

      <a href='{link}'>Verify your email address</a><br><br>
      
      If the link above does not work, please go to {link} in your browser.<br><br>

      Thanks,<br>
      Chinmaya Mission IT Team
      
      """
      return event
