import unittest
import requests


class CommonTestCase(unittest.TestCase):
    API_ENDPOINT = "http://localhost:8001"
    FORM_ID = "e4548443-99da-4340-b825-3f09921b4df5"
    maxDiff = None

    def api_get(self, path, action="", params={}, status=200, auth=False):
        """Make a json request to api."""
        return self.api_post(path, action=action, params=params, status=status, auth=auth, method="GET")

    def api_post(self, path, action="", params={}, jsondata=None, data=None, status=200, auth=False, method="POST"):
        """Make a json POST request to api."""
        if action:
            params["action"] = action
        if auth:
            params["apiKey"] = self.API_KEY
        if method == "GET":
            r = requests.get(self.API_ENDPOINT + path, params=params)
        elif method == "POST":
            r = requests.post(self.API_ENDPOINT + path, params=params,
                              json=jsondata, data=data)
            # if jsondata:
            #     r = requests.post(API_ENDPOINT, params=params, json=jsondata, data=data)
            # else:
            #     r = requests.post(API_ENDPOINT, params=params, data=data)
        try:
            self.assertEqual(r.status_code, status)
        except AssertionError:
            print("===BEGIN DEBUG===")
            print("RES URL", r.url, "\nREQ BODY", r.request.body,
                  "\nREQ HEADERS", r.request.headers, "\nRES VALUE", r.text, "\nJSONDATA", jsondata)
            print("===END DEBUG===")
            raise
        return r.json()

    def submit_with_data(self, data, extraParams={}, **kwargs):
        params = dict({
            "formVersion": 1,
            "formId": self.FORM_ID,
            "modifyLink": "http://cff-test-modify-link"
        }, **extraParams)
        body = self.api_post("formSubmit", params=params,
                             jsondata=data, **kwargs)
        return body
        # print(body)
        # responseId = body['res'].pop('id')
        # return body, responseId
    def render_response(self, formId, responseId):
        data = {
            "version": 1,
            "id": formId,
            "resid": responseId
        }
        body = self.api_get("formRender", data)
        return body