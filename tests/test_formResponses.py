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
        # PAYMENT_TYPE = "Cash"
        # data = dict(self.FORM_DATA, **{"manualEntry": PAYMENT_TYPE})
        # body = self.submit_with_data(data, extraParams={"authKey": self.AUTH_KEY_SUCCESS}, status=200)
        # responseId = body['res'].pop("id")
        # expected_response = dict(self.FORM_EXPECTED_RESPONSE, **{"paid": True})
        # self.assertEqual(body['res'], expected_response)
        # responseLoaded = self.render_response(self.FORM_ID, responseId)["res"]["responseLoaded"]
        # self.assertEqual(responseLoaded["PAID"], True)
        # self.assertNotIn("manualEntry", responseLoaded["value"])
        # found = False
        # for history in responseLoaded["PAYMENT_HISTORY"]:
        #     if history["method"] == "cff:manualEntry:" + PAYMENT_TYPE and history["amount"] == 25.0:
        #         found = True
        #         break