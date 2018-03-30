from .test import CommonTestCase

class FormResponses(CommonTestCase):
    def test_list_forms(self):
        """Load form lists."""
        centerId = 1
        response = self.api_get("/centers/{}".format(centerId))
        self.assertTrue(len(response['res']) > 0, "No forms returned!")
    def test_render_form(self):
        """Render form."""
        response = self.api_get("/forms/{}/render".format(self.FORM_ID))["res"]
        self.assertIn("schema", response)
        self.assertIn("schemaModifier", response)
        self.assertIn("value", response["schema"])
        self.assertIn("value", response["schemaModifier"])
    def test_load_responses(self):
        response = self.api_get("/forms/{}/responses".format(self.FORM_ID))
        self.assertTrue(len(response['res']) > 0, 'No responses found!')
    def test_response_summary(self):
        """Test aggregate summary of data."""
        pass