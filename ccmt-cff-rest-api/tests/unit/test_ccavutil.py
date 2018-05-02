"""
python -m unittest tests.unit.test_ccavutil
netsh interface portproxy add v4tov4 listenport=80 listenaddress=localhost connectport=8000 connectaddress=localhost
"""
from chalicelib.util.ccavutil import POSSIBLE_PARAMS, encrypt, decrypt
import unittest

INPUT_DATA = {param: "test123123" for param in POSSIBLE_PARAMS}
WORKING_KEY = 'ahuahuahu'.encode()#.encode('latin-1')

class TestCcavutil(unittest.TestCase):
  maxDiff = None
  def test_encrypt_decrypt(self):
    encrypted = encrypt(INPUT_DATA, WORKING_KEY)
    decrypted = decrypt(encrypted, WORKING_KEY)
    self.assertEqual(INPUT_DATA, decrypted)
    print(encrypted)