"""
python -m unittest tests.integration.test_ipn
"""
import unittest
from chalice.config import Config
from chalice.local import LocalGateway
import json
from .constants import FORM_ID
from app import app

class FormIpn(unittest.TestCase):
    def setUp(self):
        with open(".chalice/config.json") as file:
            self.lg = LocalGateway(app, Config(chalice_stage="beta", config_from_disk=json.load(file)))
    def test_ipn_duplicate(self):
        RESP_ID = "3b971455-639b-4007-9c1f-4bdcc36ccff7"
        # e4548443-99da-4340-b825-3f09921b4df5/
        # ipn_value = "mc_gross=25.00&protection_eligibility=Eligible&address_status=confirmed&item_number1=Registration for Training Only&payer_id=A4CSL993V3BDG&address_street=1 Main St&payment_date=10:46:50 Apr 19, 2018 PDT&payment_status=Completed&charset=windows-1252&address_zip=95131&first_name=test&mc_fee=1.03&address_country_code=US&address_name=test buyer&notify_version=3.9&custom=e4548443-99da-4340-b825-3f09921b4df5/3b971455-639b-4007-9c1f-4bdcc36ccff7&payer_status=verified&business=aramaswamis-facilitator@gmail.com&address_country=United States&num_cart_items=1&address_city=San Jose&verify_sign=AG.qEXNvQtjbT-x9GRLrGuqZZrFtA72rYcpgXkP2gameENAdYvwksYQE&payer_email=aramaswamis-buyer@gmail.com&txn_id=1TY00674HF6530836&payment_type=instant&last_name=buyer&item_name1=2018 CMSJ OM Run&address_state=CA&receiver_email=aramaswamis-facilitator@gmail.com&payment_fee=1.03&quantity1=1&receiver_id=T4A6C58SP7PP2&txn_type=cart&mc_gross_1=25.00&mc_currency=USD&residence_country=US&test_ipn=1&transaction_subject=&payment_gross=25.00&ipn_track_id=c7f68112760b6"
        ipn_value = "mc_gross=25.00&protection_eligibility=Eligible&address_status=confirmed&item_number1=Registration for Training Only&payer_id=VE2HLZ5ZKU7BE&address_street=10570 victory gate dr&payment_date=10:27:30 Apr 19, 2018 PDT&payment_status=Completed&charset=windows-1252&address_zip=30022&first_name=Ashwin&mc_fee=1.03&address_country_code=US&address_name=outplayed apps&notify_version=3.9&custom={}/{}&payer_status=unverified&business=aramaswamis-facilitator@gmail.com&address_country=United States&num_cart_items=1&address_city=Johns creek&verify_sign=AU-C7Ml6CZ.YODugGUkMlAUH5j5nAdi7DA0aXYYb.kcZT3-n-fqYBTYy&payer_email=aramaswamis@gmail.com&txn_id=7XD19477EF695003H&payment_type=instant&payer_business_name=outplayed apps&last_name=Ramaswami&address_state=GA&item_name1=2018 CMSJ OM Run&receiver_email=aramaswamis-facilitator@gmail.com&payment_fee=1.03&quantity1=1&receiver_id=T4A6C58SP7PP2&txn_type=cart&mc_gross_1=25.00&mc_currency=USD&residence_country=US&test_ipn=1&transaction_subject=&payment_gross=25.00&ipn_track_id=fb67cfeee112e".format(FORM_ID, RESP_ID)
        response = self.lg.handle_request(method='POST',
                                          path='/responses/{}/ipn'.format(RESP_ID),
                                          headers={},
                                          body=ipn_value)
        self.assertEqual(response['statusCode'], 500, response)
        # todo: should this be 4xx instead?
    def test_ipn_success(self):
        # asd
        pass