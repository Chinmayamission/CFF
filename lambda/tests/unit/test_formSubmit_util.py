"""
pipenv run python -m unittest tests.unit.test_formSubmit_util
"""
from chalicelib.util.formSubmit.emailer import display_form_dict
import unittest


class FormSubmitUtil(unittest.TestCase):
    def test_display_form_dict_simple(self):
        table = display_form_dict({"a": "b"})
        self.assertEqual(table, "<table><tr><th>A</th><td>b</td></tr></table>")

    def test_display_form_dict_nested_object(self):
        table = display_form_dict({"a": "b", "c": {"d": "e"}})
        self.assertEqual(
            table,
            "<table><tr><th>A</th><td>b</td></tr><tr><th>C: D</th><td>e</td></tr></table>",
        )

    def test_display_form_dict_array_simple(self):
        table = display_form_dict({"a": "b", "participants": ["name1", "name2"]})
        self.assertEqual(
            table,
            "<table><tr><th>A</th><td>b</td></tr><tr><th>Participant 1 </th><td>name1</td></tr><tr><th>Participant 2 </th><td>name2</td></tr></table>",
        )

    def test_display_form_dict_array(self):
        table = display_form_dict(
            {"a": "b", "participants": [{"name": "name1"}, {"name": "name2"}]}
        )
        self.assertEqual(
            table,
            "<table><tr><th>A</th><td>b</td></tr><tr><th>Participant 1 Name</th><td>name1</td></tr><tr><th>Participant 2 Name</th><td>name2</td></tr></table>",
        )
