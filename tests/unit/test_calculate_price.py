"""
pipenv run python -m unittest tests.unit.test_calculate_price
"""
from chalicelib.util.formSubmit.util import calculate_price
import unittest

class TestCalculatePrice(unittest.TestCase):
    def test_basic(self):
        price = calculate_price("x * 12", {"x": 1})
        self.assertEqual(price, 12.0)
    def test_array_length(self):
        price = calculate_price("participants * 25", {"participants": [1,2,3]})
        self.assertEqual(price, 75.0)
    @unittest.skip("not working")
    def test_array_index(self):
        price = calculate_price("rooms[0] * 25", {"rooms": [[1,2,3]] })
        self.assertEqual(price, 75.0)
    def test_nested_value(self):
        price = calculate_price("participant.x * 25", {"participant": {"x": 2}})
        self.assertEqual(price, 50.0)
    def test_nested_value_return_zero_when_undefined(self):
        price = calculate_price("participant.x * 25", {"a": "b"})
        self.assertEqual(price, 0.0)
    def test_check_equality_of_array_item(self):
        price = calculate_price("participants.race:5K", {"participants": [{"name": "A", "race": "5K"}, {"name": "B", "race": "5K"}, {"name": "C", "race": "10K"}]})
        self.assertEqual(price, 2.0)
        price = calculate_price("(participants.race:5K) * 25", {"participants": [{"name": "A", "race": "5K"}, {"name": "B", "race": "5K"}, {"name": "C", "race": "10K"}]})
        self.assertEqual(price, 50.0)
    def test_check_equality_none(self):
        price = calculate_price("(participants.race:None) * 25", {"participants": [{"name": "A", "race": "5K"}, {"name": "B", "race": "5K"}, {"name": "C", "race": "10K"}]})
        self.assertEqual(price, 0.0)
    @unittest.skip("spaces not supported")
    def test_equality_string_value(self):
        price = calculate_price("(participants.race:'5K OK') * 25", {"participants": [{"name": "A", "race": "5K OK"}, {"name": "B", "race": "5K OK"}, {"name": "C", "race": "10K"}]})
        self.assertEqual(price, 50.0)
    def test_equality_count(self):
        price = calculate_price("$participants.race:5K", {"acceptTerms":True,"contact_name":{"last":"test","first":"test"},"address":{"zipcode":"test","state":"test","city":"test","line2":"test","line1":"test"},"phone":"7708182022","email":"aramaswamis+12@gmail.com","participants":[{"name":{"last":"test","first":"test"},"gender":"F","race":"5K","age":16,"shirt_size":"Youth M"}]})
        self.assertEqual(price, 1.0)
    def test_more_math(self):
        price = calculate_price("$roundOff * (16 + $total % 5)", {"roundOff": True, "total": 87})
        self.assertEqual(price, 18.0)
        price = calculate_price("$roundOff * (16 + $total % 5)", {"roundOff": False, "total": 87})
        self.assertEqual(price, 0.0)
    @unittest.skip("spaces not supported")
    def test_equality_strings(self):
        price = calculate_price("age < 13 and race:'Half Marathon'==1", {"age": 12, "race": "Half Marathon"})
        self.assertEqual(price, True)
        price = calculate_price("age < 13 and race:'Half Marathon'==1", {"age": 12, "race": "Full Marathon"})
        self.assertEqual(price, False)
    def test_boolean(self):
        price = calculate_price("participants.has_bib_name", {"participants": [{"has_bib_name": True, "race": "5K - OK"}, {"has_bib_name": False, "race": "5K - OK"}, {"bib_name": "250", "race": "10K"}]})
        self.assertEqual(price, 1.0)
    def test_array_calc_subtraction(self):
        price = calculate_price("(participants - participants.race:10K) * 25", {"participants": [{"bib_name": "as", "race": "5K - OK"}, {"bib_name": "32", "race": "5K - OK"}, {"bib_name": "250", "race": "10K"}]})
        self.assertEqual(price, 50.0)
    def test_array_calc_subtraction_2(self):
        price = calculate_price("$participants - $participants.age:1",  {"participants": [{"age": 10}, {"age": 1}]})
        self.assertEqual(price, 1.0)
    def test_array_calc_subtraction_multiple(self):
        price = calculate_price("$participants - $participants.age:1 - $participants.age:2 - $participants.age:3",  {"participants": [{"age": 10}, {"age": 1}, {"age": 2}]})
        self.assertEqual(price, 1.0)
    def test_array_item_calculations(self):
        data = {"sponsorshipAnnadaanam": [300, 600]}
        price = calculate_price("2 * sponsorshipAnnadaanam:300 + sponsorshipAnnadaanam:600", data)
        self.assertEqual(price, 3)
    def test_yeardiff_calc(self):
        data = {"dob": "1999-01-02"}
        price = calculate_price("cff_yeardiff('2019-09-01', dob)", data)
        self.assertEqual(price, 20.0)
    def test_countarray_calc(self):
        data = {
            "participants": [
                {"dob": "1999-01-02"},
                {"dob": "2019-01-02"},
                {"dob": "2018-01-02"},
            ]
        }
        expression = "cff_countArray(CFF_FULL_participants, \"cff_yeardiff('2019-09-01', dob) > 2\")"
        self.assertEqual(calculate_price(expression, data), 1.0)
    def test_round_up_next_cent(self):
        price = calculate_price("1/3", {})
        self.assertEqual(price, 0.34)
    @unittest.skip("not implemented yet")
    def test_arbitrary_strings(self):
        price = calculate_price("(participants.race:'5K - OK') * 25", {"participants": [{"name": "A", "race": "5K - OK"}, {"name": "B", "race": "5K - OK"}, {"name": "C", "race": "10K"}]})
        self.assertEqual(price, 50.0)