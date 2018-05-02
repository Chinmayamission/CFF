from pydash.objects import get

def fill_paymentMethods_with_data(paymentMethods, form_data):
  new_paymentMethods = {}
  for paymentMethodName, paymentMethod in paymentMethods.items():
    new_paymentMethods[paymentMethodName] = {}
    for key, value in paymentMethod.items():
      if type(value) is str:
        value = [value]
      if type(value) is list:
        value = [(get(form_data, x[1:], x) if x.startswith("$") else x) for x in value]
        value = "".join(value)
      new_paymentMethods[paymentMethodName][key] = value
  return new_paymentMethods