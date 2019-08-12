from chalicelib.util.formSubmit.paymentMethods import fill_paymentMethods_with_data

"""
python -m unittest tests.unit.test_paymentMethods
"""
import unittest


class TestPaymentMethods(unittest.TestCase):
    def test_simple_no_refs(self):
        paymentMethods = {"ccavenue": {"name": "Hello", "age": "12"}}
        data = {}
        self.assertEqual(
            fill_paymentMethods_with_data(paymentMethods, data), paymentMethods
        )

    def test_simple_join_array_no_refs(self):
        paymentMethods = {"ccavenue": {
            "name": ["Hello", " Blah"], "age": "10"}}
        data = {}
        expectedOutput = {"ccavenue": {"name": "Hello Blah", "age": "10"}}
        self.assertEqual(
            fill_paymentMethods_with_data(paymentMethods, data), expectedOutput
        )

    def test_refs(self):
        paymentMethods = {"ccavenue": {"name": ["$name"], "age": "$age"}}
        data = {"name": "John", "age": "44"}
        expectedOutput = {"ccavenue": {"name": "John", "age": "44"}}
        self.assertEqual(
            fill_paymentMethods_with_data(paymentMethods, data), expectedOutput
        )

    def test_refs_join_array(self):
        paymentMethods = {
            "ccavenue": {"name": ["$name.first", " ", "$name.last"], "age": "$age"}
        }
        data = {"name": {"first": "John", "last": "Proctor"}, "age": "44"}
        expectedOutput = {"ccavenue": {"name": "John Proctor", "age": "44"}}
        self.assertEqual(
            fill_paymentMethods_with_data(paymentMethods, data), expectedOutput
        )

    def test_refs_join_array_with_non_string(self):
        paymentMethods = {
            "ccavenue": {
                "option": True,
                "name": ["$name.first", " ", "$name.last"],
                "age": "$age",
            }
        }
        data = {"name": {"first": "John", "last": "Proctor"}, "age": "44"}
        expectedOutput = {
            "ccavenue": {"option": True, "name": "John Proctor", "age": "44"}
        }
        self.assertEqual(
            fill_paymentMethods_with_data(paymentMethods, data), expectedOutput
        )


"""
    paymentMethodsList = [
      {"ccavenue": {"name": "Ashwin", "age": "Ramaswami"}},
      {"ccavenue": {"name": "Ashwin", "age": "Ramaswami"}, "ccavenue2": {"name": "Ashwin", "age": "Ramaswami"}}
    ]
    data = {}
    for i, paymentMethods in enumerate(paymentMethodsList):
      with self.subTest(paymentMethods=paymentMethods):
        self.assertEqual(fill_paymentMethods_with_data(paymentMethods, data), paymentMethods)
"""
