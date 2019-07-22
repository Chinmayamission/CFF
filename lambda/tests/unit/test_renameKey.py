from chalicelib.util.renameKey import renameKey
"""
python -m unittest tests.unit.test_renameKey
"""
import unittest

class TestRenameKey(unittest.TestCase):
  def test_rename_simple(self):
    self.assertEqual(renameKey({"$ref": "a"}, "$ref", "__$ref"), {"__$ref": "a"})
    self.assertEqual(renameKey({"items": [{"$ref": "a"}]}, "$ref", "__$ref"), {"items": [{"__$ref": "a"}]})