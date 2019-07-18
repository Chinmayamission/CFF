from pydash.objects import set_
from chalicelib.util.formSubmit.util import calculate_price
import copy

def postprocess_response_data(response_data, steps):
    response_data = copy.deepcopy(response_data)
    for item in steps:
        if item["type"] == "expr":
            value = calculate_price(item["value"]["value"], response_data, False)
            set_(response_data, item["value"]["key"], value)
    return response_data