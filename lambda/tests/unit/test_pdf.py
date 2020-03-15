"""
pipenv run python -m unittest tests.unit.test_pdf
"""
import unittest
from chalicelib.util.pdf_generator import convert_html_to_pdf


class TestPdf(unittest.TestCase):
    def test_generate_pdf(self):
        body = "<div style='background: yellow'>hello world <h1>hu!2</h1><script>document.write('hee!')</script><div>"
        convert_html_to_pdf(body)
