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
                                          headers={"Content-Type": "application/x-www-form-urlencoded"},
                                          body=ipn_value)
        self.assertEqual(response['statusCode'], 500, response)
        # todo: should this be 4xx instead?
    def test_ipn_success(self):
        # asd
        pass
    def test_ipn_v2_duplicate(self):
        formId = "e08b694e-27b8-418f-ad7c-79a0b89f52be"
        respId = "9c6992d0-45e1-49dd-acbd-6bd376603630"
        ipn_value = "mc_gross=1.00&protection_eligibility=Eligible&address_status=confirmed&item_number1=Base Registration&item_number2=$25 for each additional child&payer_id=A4CSL993V3BDG&address_street=1 Main St&payment_date=19:57:49 May 23, 2018 PDT&payment_status=Completed&charset=windows-1252&address_zip=95131&first_name=test&mc_fee=0.33&address_country_code=US&address_name=test buyer&notify_version=3.9&custom={}/{}&payer_status=verified&business=aramaswamis-facilitator@gmail.com&address_country=United States&num_cart_items=2&address_city=San Jose&verify_sign=AGV6csTg6wZeXiLA3TJ1jLQ3z0LlAh8kX529e3I8BAcD2qpKcKlQOEzO&payer_email=aramaswamis-buyer@gmail.com&txn_id=0TC74719VH5246718&payment_type=instant&last_name=buyer&address_state=CA&item_name1=Base Registration&receiver_email=aramaswamis-facilitator@gmail.com&item_name2=Additional Registration&payment_fee=0.33&quantity1=1&quantity2=1&receiver_id=T4A6C58SP7PP2&txn_type=cart&mc_gross_1=0.50&mc_currency=USD&mc_gross_2=0.50&residence_country=US&test_ipn=1&transaction_subject=&payment_gross=1.00&ipn_track_id=6db0da264b868".format(formId, respId)
        response = self.lg.handle_request(method='POST',
                                    path='/responses/{}/ipn'.format(respId),
                                    headers={"Content-Type": "application/x-www-form-urlencoded"},
                                    body=ipn_value)
        self.assertEqual(response['statusCode'], 500, response)
    def test_ipn_v2(self):
        formId = "e08b694e-27b8-418f-ad7c-79a0b89f52be"
        respId = "6f04eae0-cfa1-4a9e-a479-c9fd33685f42"
        ipn_value = f"mc_gross=1.00&protection_eligibility=Eligible&address_status=confirmed&item_number1=Base Registration&item_number2=$25 for each additional child&payer_id=A4CSL993V3BDG&address_street=1 Main St&payment_date=20:51:56 May 23, 2018 PDT&payment_status=Completed&charset=windows-1252&address_zip=95131&first_name=test&mc_fee=0.33&address_country_code=US&address_name=test buyer&notify_version=3.9&custom={formId}/{respId}&payer_status=verified&business=aramaswamis-facilitator@gmail.com&address_country=United States&num_cart_items=2&address_city=San Jose&verify_sign=Ad9FJ2m.C8oQHWRDydCR9PjtwuG0A3a8ACOCmj.8zC5TIp7VZ7UU2pU9&payer_email=aramaswamis-buyer@gmail.com&txn_id=9S303752WL4567910&payment_type=instant&last_name=buyer&address_state=CA&item_name1=Base Registration&receiver_email=aramaswamis-facilitator@gmail.com&item_name2=Additional Registration&payment_fee=0.33&quantity1=1&quantity2=1&receiver_id=T4A6C58SP7PP2&txn_type=cart&mc_gross_1=0.50&mc_currency=USD&mc_gross_2=0.50&residence_country=US&test_ipn=1&transaction_subject=&payment_gross=1.00&ipn_track_id=288fbb5f4d134"
        response = self.lg.handle_request(method='POST',
                                    path='/responses/{}/ipn'.format(respId),
                                    headers={"Content-Type": "application/x-www-form-urlencoded"},
                                    body=ipn_value)
        print(response)