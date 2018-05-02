"""
python -m unittest tests.unit.test_ccavutil
"""
from chalicelib.util.ccavutil import POSSIBLE_PARAMS, encrypt, decrypt
import unittest

INPUT_DATA = {param: "test" for param in POSSIBLE_PARAMS}
WORKING_KEY = 'asdasdlk9'.encode()#.encode('latin-1')

class TestCcavutil(unittest.TestCase):
  def test_encrypt_decrypt(self):
    encrypted = encrypt(INPUT_DATA, WORKING_KEY)
    decrypted = decrypt(encrypted, WORKING_KEY)
    print(encrypted)