from chalicelib.util.renameKey import renameKey, replaceKey

"""
npm test -- tests.unit.test_renameKey
"""
import unittest


class TestRenameKey(unittest.TestCase):
    def test_rename_simple(self):
        self.assertEqual(renameKey({"$ref": "a"}, "$ref", "__$ref"), {"__$ref": "a"})
        self.assertEqual(
            renameKey({"items": [{"$ref": "a"}]}, "$ref", "__$ref"),
            {"items": [{"__$ref": "a"}]},
        )

    def test_replace_dict_in_list(self):
        orig = [{"a": [{"b": [{"$ref": {"_id": None, "n": {"$ref": 1}}}]}]}]
        new = [{"a": [{"b": [{"__$ref": {"_id": None, "n": {"__$ref": 1}}}]}]}]
        self.assertEqual(renameKey(orig, "$ref", "__$ref"), new)


class TestReplaceKey(unittest.TestCase):
    def test_replace_simple(self):
        self.assertEqual(replaceKey({"$ref": "a"}, "$", "|"), {"|ref": "a"})
        self.assertEqual(
            replaceKey({"items": [{"$ref": "a"}]}, "$", "|"), {"items": [{"|ref": "a"}]}
        )
        self.assertEqual(replaceKey({"a.b.c": "a"}, ".", "||"), {"a||b||c": "a"})

    def test_replace_dataOptionView(self):
        orig = [
            {
                "id": "aggregateView",
                "type": "stats",
                "stats": [
                    {
                        "type": "single",
                        "title": "a",
                        "queryType": "aggregate",
                        "queryValue": [
                            {"value.registrationType": "sponsorship"},
                            {"$group": {"_id": None, "n": {"$sum": 1}}},
                        ],
                    }
                ],
            }
        ]
        new = [
            {
                "id": "aggregateView",
                "type": "stats",
                "stats": [
                    {
                        "type": "single",
                        "title": "a",
                        "queryType": "aggregate",
                        "queryValue": [
                            {"value.registrationType": "sponsorship"},
                            {"|group": {"_id": None, "n": {"|sum": 1}}},
                        ],
                    }
                ],
            }
        ]
        # self.assertEqual(replaceKey(orig[0]["stats"][0]["queryValue"], "$", "|"), new[0]["stats"][0]["queryValue"])
        self.assertEqual(replaceKey(orig, "$", "|"), new)
