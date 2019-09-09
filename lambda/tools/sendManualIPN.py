"""
Manually send an IPN, given an IPN dict and response ID
"""
import requests
import urllib.parse

BETA = False

ipn_dict = {
  # ...
}
responseId = ""
URL = f"https://xpqeqfjgwd.execute-api.us-east-1.amazonaws.com/v2/responses/{responseId}/ipn"


ipn_body = urllib.parse.urlencode(ipn_dict, encoding="windows-1252")
print(ipn_body)
headers = {
    "content-type": "application/x-www-form-urlencoded"
}
r = requests.post(URL, data=ipn_body, headers=headers, verify=True)
r.raise_for_status()
print("response", r.text)