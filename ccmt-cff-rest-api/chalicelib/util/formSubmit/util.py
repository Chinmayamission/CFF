from py_expression_eval import Parser
import flatdict
import re
from collections import defaultdict
"""
workon cff
python -m doctest functions/forms/lib/util.py
"""

DELIM_VALUE = "ASKLDJAKSLDJ12903812"
SPACE_VALUE = "AJSID2309483ASFSDLJF"

def parse_number_formula(data, variable, numeric=True):
    """
    >>> parse_number_formula({"A": 12}, "A")
    12.0
    >>> parse_number_formula({"A": {"B":15}}, "A.B")
    15.0
    >>> parse_number_formula({"participants": [{"5K": 1},{"10K": 2},{"5K":3}]}, "participants.5K")
    4.0
    """
    variable = variable.replace(SPACE_VALUE, " ")
    if DELIM_VALUE in variable:
        variable, key_value_eq = variable.split(DELIM_VALUE, 1)
    else:
        key_value_eq = None
    value = deep_access_list(data, variable.strip().split("."), key_value_eq)
    if numeric:
        if not value:
            return 0
        if type(value) is list:
            value = len(value)
        if key_value_eq and type(value) is str:
            value = (value.strip() == key_value_eq.strip())
        if isinstance(value, bool):
            value = 1 if value is True else 0
        if not isinstance(value, (int, float)):
            raise ValueError("Key {} is not numeric - it's equal to {}".format(variable, value))
        return round(float(value), 2)
    else:
        return value

def dict_array_to_sum_dict(original, key_value_eq = None):
    """
    >>> dict_array_to_sum_dict([{"a":2, "b":5}, {"a":1, "b":6}]) 
    {'a': 3.0, 'b': 11.0}
    >>> dict_array_to_sum_dict([{"a":"one"}, {"a":"two"}, {"a":"one"}], "one") 
    {'a': 2.0}
    >>> dict_array_to_sum_dict([{"a":"one"}, {"a":"two"}, {"a":"one"}], "zero") 
    {}
    """"""
    Converts array of dictionaries to a single dictionary consisting of the sum.
    """
    dct = defaultdict(float)
    for d in original:
        for k, v in d.items():
            if v == key_value_eq:
                dct[k] += 1
            elif isinstance(v, (int, float)):
                dct[k] += float(v)
            #elif not key_value_eq and v: #count number of occurrences of a string.
            #    dct[k] += 1
    return dict(dct)

def deep_access_list(x, keylist, key_value_eq=None):
    """
    >>> deep_access_list({"a":2}, ["a"])
    2
    >>> deep_access_list({"a":[{"a":2, "b":5}, {"a":1, "b":6}]}, ["a", "a"])
    3.0
    >>> deep_access_list({"a":[{"a":"cat1", "b":"cat2"}, {"a":"cat3", "b":"cat2"}]}, ["a", "a"], "cat1")
    1.0
    >>> deep_access_list({"a":[{"a":"cat1", "b":"cat2"}, {"a":"cat3", "b":"cat2"}]}, ["a", "b"], "cat2")
    2.0
    """
    """
    Access an arbitrarily nested part of dictionary x using keylist, if key equals keyname."""
    val = x
    for key in keylist:
        if type(val) is list:
            val = dict_array_to_sum_dict(val, key_value_eq).get(key, 0.0)
        # 30
        else:
            val = val.get(key, 0)
    return val

def deep_access(x, keylist):
    """Access an arbitrary nested part of dictionary x using keylist."""
    val = x
    for key in keylist:
        val = val.get(key, 0)
    return val 

def calculate_price(expressionString, data):
    """
    >>> calculate_price("x * 12", {"x": 1})
    12.0
    >>> calculate_price("participants * 25", {"participants": [1,2,3]})
    75.0
    >>> calculate_price("participant.x * 25", {"participant": {"x": 2}})
    50.0
    >>> calculate_price("participants.race:5K", {"participants": [{"name": "A", "race": "5K"}, {"name": "B", "race": "5K"}, {"name": "C", "race": "10K"}]})
    2.0
    >>> calculate_price("(participants.race:5K) * 25", {"participants": [{"name": "A", "race": "5K"}, {"name": "B", "race": "5K"}, {"name": "C", "race": "10K"}]})
    50.0
    >>> calculate_price("(participants.race:None) * 25", {"participants": [{"name": "A", "race": "5K"}, {"name": "B", "race": "5K"}, {"name": "C", "race": "10K"}]})
    0.0
    >>> calculate_price("(participants.race:'5K OK') * 25", {"participants": [{"name": "A", "race": "5K OK"}, {"name": "B", "race": "5K OK"}, {"name": "C", "race": "10K"}]})
    50.0
    >>> calculate_price("$participants.race:5K", {"acceptTerms":True,"contact_name":{"last":"test","first":"test"},"address":{"zipcode":"test","state":"test","city":"test","line2":"test","line1":"test"},"phone":"7708182022","email":"aramaswamis+12@gmail.com","participants":[{"name":{"last":"test","first":"test"},"gender":"F","race":"5K","age":16,"shirt_size":"Youth M"}]})
    1.0
    >>> calculate_price("$roundOff * (16 + $total % 5)", {"roundOff": True, "total": 87})
    18.0
    >>> calculate_price("$roundOff * (16 + $total % 5)", {"roundOff": False, "total": 87})
    0.0
    >>> # Test for equality of strings:
    >>> calculate_price("age < 13 and race:'Half Marathon'==1", {"age": 12, "race": "Half Marathon"})
    True
    >>> calculate_price("age < 13 and race:'Half Marathon'==1", {"age": 12, "race": "Full Marathon"})
    False
    >>> # Test for number:
    >>> calculate_price("participants.has_bib_name", {"participants": [{"has_bib_name": True, "race": "5K - OK"}, {"has_bib_name": False, "race": "5K - OK"}, {"bib_name": "250", "race": "10K"}]})
    1.0
    >>> calculate_price("(participants - participants.race:10K) * 25", {"participants": [{"bib_name": "as", "race": "5K - OK"}, {"bib_name": "32", "race": "5K - OK"}, {"bib_name": "250", "race": "10K"}]})
    50.0
    >>> # Arbitrary strings (not working):
    >>> calculate_price("(participants.race:'5K - OK') * 25", {"participants": [{"name": "A", "race": "5K - OK"}, {"name": "B", "race": "5K - OK"}, {"name": "C", "race": "10K"}]})
    50.0
    """
    """Calculates price based on the expression. 
    For example, "participants.age * 12"
    "participants * 12" will use participants' length if it is an array.
    todo: base 64 encode here.
    """
    if ":" in expressionString:
        # py_expression_eval does not allow : characters.
        expressionString = expressionString.replace(":", DELIM_VALUE)
    if " " in expressionString:
        # replace all spaces within single quotes and remove quotation marks.
        for quoted_part in re.findall(r'(\'.+?\')', expressionString):
            replaced = quoted_part.replace(" ", SPACE_VALUE)
            replaced = replaced.replace("'", "")
            expressionString = expressionString.replace(quoted_part, replaced)
    expressionString = expressionString.replace("$", "")
    #raise Exception(expressionString)
    parser = Parser()
    expr = parser.parse(expressionString)
    context = {}
    for variable in expr.variables():
        context[variable] = parse_number_formula(data, variable)
        
    return expr.evaluate(context)

def format_payment(total, currency='USD'):
    if currency == "USD":
        return "${:,.2f}".format(total)
    return "{} {:,.2f}".format(currency, total)
def format_paymentInfo(paymentInfo):
    return format_payment(paymentInfo.get("total", "N/A"), paymentInfo.get("currency", "USD"))

def human_readable_key(key, delimiter=":"):
    """
    >>> human_readable_key("participants:0:name")
    'participant 1 name'
    >>> human_readable_key("participants_hello_world:0:name")
    'participants hello world 1 name'
    """
    """Makes a delimited key human-readable.
    Ex: participants:0:name --> Participant 1 Name"""
    key = key.replace("_", " ")
    delimiter = re.escape(delimiter)
    key = re.sub(r's?{0}(\d+){0}?'.format(delimiter), lambda x: " " + str(int(x.group(1)) + 1) + " ", key)
    key = re.sub(delimiter, ": ", key)
    return key

def dict_to_table(dict, human_readable=True):
    flat = flatdict.FlatDict(dict)
    table = "<table>"
    for key, value in flat.items():
        if human_readable: key = human_readable_key(key)
        table += "<tr><th>{}</th><td>{}</td></tr>".format(key, value)
    table += "</table>"
    return table

spacing = "&nbsp;&nbsp;&nbsp;"
def render_value(key, value, prefix=""):
    text = ""
    if type(value) is dict:
        for (k, v) in value.items():
            text += "<br>{}".format(dict_to_table(v))
    elif type(value) is list:
        for (i, v) in enumerate(value):
            text += "<br>{}. {}".format(i + 1, render_value(k, v, prefix))
    else:
        text += "<br><b>{}</b><span>{}</span>".format(key, value)
    return text

def display_form_dict(dict):
    return dict_to_table(dict)
    text = "<div>"
    for key, value in dict.items():
        text += render_value(key, value)
    text += "</div>"