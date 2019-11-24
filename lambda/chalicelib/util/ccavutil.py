from Cryptodome.Cipher import AES
import hashlib
from urllib.parse import urlencode, parse_qsl
import binascii


def pad(data):
    length = 16 - (len(data) % 16)
    data += bytes([length]) * length
    return data


BS = int(AES.block_size)
# get unpad function from https://gist.github.com/sandromello/3764308


def unpad(s):
    return s[0 : -ord(s[-1])]


def encrypt(inputDict, workingKey):
    iv = "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f"
    plainText = urlencode(inputDict)
    plainText = pad(plainText.encode("utf-8"))
    encDigest = hashlib.md5()  # bytes("text","ascii")
    encDigest.update(workingKey.encode("utf-8"))
    enc_cipher = AES.new(encDigest.digest(), AES.MODE_CBC, iv.encode("latin-1"))
    encryptedText = enc_cipher.encrypt(plainText)
    return binascii.hexlify(encryptedText).decode("utf-8")


def decrypt(cipherText, workingKey):
    iv = "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f"
    decDigest = hashlib.md5()  # md5.new ()
    decDigest.update(workingKey.encode("utf-8"))
    encryptedText = binascii.unhexlify(cipherText)
    dec_cipher = AES.new(decDigest.digest(), AES.MODE_CBC, iv.encode("latin-1"))
    decryptedText = dec_cipher.decrypt(encryptedText).decode("utf-8")
    return dict(parse_qsl(unpad(decryptedText)))
