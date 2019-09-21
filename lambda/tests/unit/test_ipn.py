import unittest
from chalicelib.routes.responseIpnListener import parse_ipn_body


class TestParseIpnBody(unittest.TestCase):
    def test_cp1252_no_special_characters(self):
        msg = """address_street=anadir&charset=windows-1252"""
        self.assertEqual(
            parse_ipn_body(msg), {"address_street": "anadir", "charset": "windows-1252"}
        )

    def test_cp1252_special_characters(self):
        msg = """address_street=a%F1adir&charset=windows-1252"""
        self.assertEqual(
            parse_ipn_body(msg), {"address_street": "añadir", "charset": "windows-1252"}
        )

    def test_utf8_no_special_characters(self):
        msg = """address_street=anadir&charset=utf-8"""
        self.assertEqual(
            parse_ipn_body(msg), {"address_street": "anadir", "charset": "utf-8"}
        )

    def test_utf8_special_characters(self):
        msg = """address_street=a%C3%B1adir&charset=utf-8"""
        self.assertEqual(
            parse_ipn_body(msg), {"address_street": "añadir", "charset": "utf-8"}
        )
