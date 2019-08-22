from chalicelib.util.patch import convert_to_json_patches, patch_predicate, unwind

"""
pipenv run python -m unittest tests.unit.test_patch
"""
import unittest


class TestPatchPredicate(unittest.TestCase):
    def test_convert_walk_to_patch(self):
        walk = {"type": "walk", "items": ["A", "B", "C"], "path": "/grade"}
        expected_patches = [
            [{"op": "add", "path": "/CFF_PATCHED", "value": False}],
            [
                {"op": "test", "path": "/grade", "value": "A"},
                {"op": "test", "path": "/CFF_PATCHED", "value": False},
                {"op": "replace", "path": "/grade", "value": "B"},
                {"op": "replace", "path": "/CFF_PATCHED", "value": True},
            ],
            [
                {"op": "test", "path": "/grade", "value": "B"},
                {"op": "test", "path": "/CFF_PATCHED", "value": False},
                {"op": "replace", "path": "/grade", "value": "C"},
                {"op": "replace", "path": "/CFF_PATCHED", "value": True},
            ],
            [{"op": "remove", "path": "/CFF_PATCHED"}],
        ]
        self.assertEqual(convert_to_json_patches(walk), expected_patches)

    def test_convert_patches_to_patch(self):
        patch = {
            "type": "patches",
            "value": [[{"op": "replace", "path": "/grade", "value": "D"}]],
        }
        expected_patches = [[{"op": "replace", "path": "/grade", "value": "D"}]]
        self.assertEqual(convert_to_json_patches(patch), expected_patches)

    def test_convert_patch_to_patch(self):
        patch = {
            "type": "patch",
            "value": [{"op": "replace", "path": "/grade", "value": "D"}],
        }
        expected_patches = [[{"op": "replace", "path": "/grade", "value": "D"}]]
        self.assertEqual(convert_to_json_patches(patch), expected_patches)

    def test_patch_unwind(self):
        patches = [
            {
                "type": "patch",
                "unwind": "/children",
                "value": [{"op": "add", "path": "/grade", "value": "D"}],
            }
        ]
        data = {"children": [{"a": "B"}, {"a": "C"}]}
        expected_data = {
            "children": [{"a": "B", "grade": "D"}, {"a": "C", "grade": "D"}]
        }
        self.assertEqual(patch_predicate(data, patches), expected_data)

    def test_patch_unwind_remove_nonexistent(self):
        patches = [
            {
                "type": "patch",
                "unwind": "/children",
                "value": [{"op": "remove", "path": "/grade"}],
            }
        ]
        data = {"children": [{"a": "B"}, {"a": "C", "grade": "D"}]}
        expected_data = {"children": [{"a": "B"}, {"a": "C"}]}
        self.assertEqual(patch_predicate(data, patches), expected_data)

    def test_walk_simple(self):
        patches = [{"type": "walk", "items": ["A", "B", "C"], "path": "/grade"}]
        self.assertEqual(patch_predicate({"grade": "A"}, patches), {"grade": "B"})
        self.assertEqual(patch_predicate({"grade": "B"}, patches), {"grade": "C"})
        self.assertEqual(patch_predicate({"grade": "C"}, patches), {"grade": "C"})
        self.assertEqual(patch_predicate({"grade": "D"}, patches), {"grade": "D"})

    def test_unwind_walk_patch(self):
        input = {
            "type": "walk",
            "unwind": "/participants",
            "items": ["A", "B", "C"],
            "path": "/grade",
        }
        data = {"participants": [{"grade": "A"}, {"grade": "B"}]}
        expected = [
            {"type": "walk", "items": ["A", "B", "C"], "path": "/participants/0/grade"},
            {"type": "walk", "items": ["A", "B", "C"], "path": "/participants/1/grade"},
        ]
        self.assertEqual(unwind(input, data), expected)

    def test_walk_nested(self):
        patches = [
            {
                "type": "walk",
                "items": ["A", "B", "C"],
                "unwind": "/participants",
                "path": "/grade",
            }
        ]
        self.assertEqual(
            patch_predicate({"participants": [{"grade": "A"}]}, patches),
            {"participants": [{"grade": "B"}]},
        )
        self.assertEqual(patch_predicate({}, patches), {})
        self.assertEqual(
            patch_predicate({"participants": []}, patches), {"participants": []}
        )
        self.assertEqual(
            patch_predicate(
                {"participants": [{"grade": "A"}, {"grade": "B"}]}, patches
            ),
            {"participants": [{"grade": "B"}, {"grade": "C"}]},
        )

    def test_walk_super_nested(self):
        patches = [
            {
                "type": "walk",
                "items": ["A", "B", "C"],
                "unwind": "/participants/A",
                "path": "/grade",
            }
        ]
        self.assertEqual(
            patch_predicate(
                {"participants": {"A": [{"grade": "A"}, {"grade": "B"}]}}, patches
            ),
            {"participants": {"A": [{"grade": "B"}, {"grade": "C"}]}},
        )

    def test_expr_parser(self):
        patches = [
            {
                "type": "patch",
                "expr": True,
                "value": [{"op": "add", "expr": "CFF_FULL_name", "path": "/custom"}],
            }
        ]
        data = {"name": "test"}
        expected = {"name": "test", "custom": "test"}
        self.assertEqual(patch_predicate(data, patches), expected)
