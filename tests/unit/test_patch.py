from chalicelib.util.patch import convert_to_json_patches, patch_predicate
"""
python -m unittest tests.unit.test_patch
"""
import unittest

class TestPatchPredicate(unittest.TestCase):
  def test_convert_walk_to_patch(self):
    walk = {"type": "walk", "items": ["A","B","C"], "path": "/grade"}
    expected_patches = [
      [
        { "op": "add", "path": "/CFF_PATCHED", "value": False }
      ],
      [
        { "op": "test", "path": "/grade", "value": "A" },
        { "op": "test", "path": "/CFF_PATCHED", "value": False },
        { "op": "replace", "path": "/grade", "value": "B" },
        { "op": "replace", "path": "/CFF_PATCHED", "value": True }
      ],
      [
        { "op": "test", "path": "/grade", "value": "B" },
        { "op": "test", "path": "/CFF_PATCHED", "value": False },
        { "op": "replace", "path": "/grade", "value": "C" },
        { "op": "replace", "path": "/CFF_PATCHED", "value": True }
      ],
      [
        { "op": "remove", "path": "/CFF_PATCHED"}
      ]
    ]
    self.assertEqual(convert_to_json_patches(walk), expected_patches)
  def test_convert_patches_to_patch(self):
    patch = {"type": "patches", "value": [[{ "op": "replace", "path": "/grade", "value": "D" }]]}
    expected_patches = [[{ "op": "replace", "path": "/grade", "value": "D" }]]
    self.assertEqual(convert_to_json_patches(patch), expected_patches)
  def test_convert_patch_to_patch(self):
    patch = {"type": "patch", "value": [{ "op": "replace", "path": "/grade", "value": "D" }]}
    expected_patches = [[{ "op": "replace", "path": "/grade", "value": "D" }]]
    self.assertEqual(convert_to_json_patches(patch), expected_patches)
  def test_walk_simple(self):
    patches = [
      {"type": "walk", "items": ["A","B","C"], "key": "grade"}
    ]
    self.assertEqual(patch_predicate({"grade": "A"}, patches), {"grade": "B"})
    self.assertEqual(patch_predicate({"grade": "B"}, patches), {"grade": "C"})
    self.assertEqual(patch_predicate({"grade": "C"}, patches), {"grade": "C"})
    self.assertEqual(patch_predicate({"grade": "D"}, patches), {"grade": "D"})