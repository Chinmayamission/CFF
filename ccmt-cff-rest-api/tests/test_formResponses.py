import unittest
from chalice.config import Config
from chalice.local import LocalGateway
import json
import boto3
AWS_PROFILE_NAME = "ashwin-cff-lambda"
dev = boto3.session.Session(profile_name=AWS_PROFILE_NAME)
boto3.setup_default_session(profile_name=AWS_PROFILE_NAME)
from app import app

CENTER_ID = 1
class FormResponses(unittest.TestCase):
    def setUp(self):
        with open(".chalice/config.json") as file:
            self.lg = LocalGateway(app, Config(chalice_stage="beta", config_from_disk=json.load(file)))
    def test_list_forms(self):
        """Load form lists."""
        response = self.lg.handle_request(method='GET',
                                          path='/centers/{}/forms'.format(CENTER_ID),
                                          headers={},
                                          body='')
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertTrue(len(body['res']) > 0, "No forms returned!")
    # def test_render_form(self):
    #     """Render form."""
    #     response = self.api_get("/forms/{}/render".format(self.FORM_ID))["res"]
    #     self.assertIn("schema", response)
    #     self.assertIn("schemaModifier", response)
    #     self.assertIn("value", response["schema"])
    #     self.assertIn("value", response["schemaModifier"])
    # def test_load_responses(self):
    #     response = self.api_get("/forms/{}/responses".format(self.FORM_ID))
    #     self.assertTrue(len(response['res']) > 0, 'No responses found!')
    # def test_response_summary(self):
    #     """Test aggregate summary of data."""
    #     pass