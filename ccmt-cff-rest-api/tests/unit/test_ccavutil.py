"""
python -m unittest tests.unit.test_ccavutil
"""
from chalicelib.util.ccavutil import POSSIBLE_PARAMS, encrypt, decrypt
from chalicelib.util.formSubmit.ccavenue import update_ccavenue_hash
import unittest

INPUT_DATA = {"a": "b"} #{param: "test1231234" for param in POSSIBLE_PARAMS}
WORKING_KEY = "asdlkjskljasdkljas"#.encode('latin-1')

class TestCcavutil(unittest.TestCase):
  maxDiff = None
  def test_encrypt_decrypt(self):
    encrypted = encrypt(INPUT_DATA, WORKING_KEY)
    decrypted = decrypt(encrypted, WORKING_KEY)
    self.assertEqual(INPUT_DATA, decrypted)
    print(encrypted)

class TestCcAvenue(unittest.TestCase):
  def test_update_ccavenue_hash(self):
    pass