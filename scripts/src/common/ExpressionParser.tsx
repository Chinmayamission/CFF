import { Parser } from "expr-eval";
import { isArray } from "lodash";
import moment from "moment";

const DELIM_VALUE = "ASFASFSDF";
const SPACE_VALUE = "SDSDGSDFS";
const DOT_VALUE = "ADKLFJSFL";

const DEFAULT_CONTEXT = {
  cff_yeardiff: (datestr1, datestr2) => {
    const d1 = moment(datestr1, "YYYY-MM-DD");
    const d2 = moment(datestr2, "YYYY-MM-DD");
    return d1.diff(d2, "years");
  },
  cff_countArray: (array, expression) => {
    return array.filter(item =>
      ExpressionParser.calculate_price(expression, item)
    ).length;
  }
};

const compare = (v, key_value_eq) => {
  return String(v).trim() === String(key_value_eq).trim();
};
export namespace ExpressionParser {
  export function dict_array_to_sum_dict(original, key_value_eq = null) {
    /*
        Converts array of dictionaries to a single dictionary consisting of the sum.
        >>> dict_array_to_sum_dict([{"a":2, "b":5}, {"a":1, "b":6}]) 
        {'a': 3.00, 'b': 11.00}
        */
    let dict = {};
    for (let d of original) {
      for (let k in d) {
        let v = d[k];
        if (compare(v, key_value_eq)) {
          dict[k] = dict[k] ? dict[k] + 1 : 1;
        } else if (!isNaN(v) && key_value_eq === null) {
          let value = parseFloat(v);
          dict[k] = dict[k] ? dict[k] + value : value;
        }
      }
    }
    return dict;
  }
  function deep_access_list(x, keylist, key_value_eq) {
    /*
        >>> deep_access_list({"a":2}, ["a"])
        2
        */
    let val = x;
    for (let key of keylist) {
      if (val && isArray(val)) {
        val = dict_array_to_sum_dict(val, key_value_eq)[key];
      } else {
        val = val ? val[key] : 0;
      }
    }
    return val;
  }
  function parse_number_formula(data, variable, numeric = true) {
    variable = variable.replace(new RegExp(SPACE_VALUE, "g"), " ");
    let key_value_eq = null;
    // console.log(variable);

    if (~variable.indexOf(DELIM_VALUE)) {
      [variable, key_value_eq] = variable.split(DELIM_VALUE);
    }
    let value = null;
    value = deep_access_list(data, variable.trim().split("."), key_value_eq);
    if (numeric) {
      if (!value) {
        // not entered yet.
        return 0;
      }
      if (value && isArray(value)) {
        // If value is an array, make it numeric.
        if (key_value_eq) {
          value = value.filter(v => compare(v, key_value_eq)).length;
        } else {
          value = value.length;
        }
      }
      if (typeof value === "string" && key_value_eq) {
        // check for equality of strings.
        value = value.trim() === key_value_eq.trim();
      }
      if (typeof value === "boolean") {
        value = value ? 1 : 0;
      }
      if (isNaN(value)) {
        return value;
      } else {
        value = parseFloat(value) || 0;
      }
      return value;
    } else {
      return value;
    }
  }
  export function calculate_price(expressionString, data, numeric = true) {
    // Analogous to the python calculate_price lambda function; parses the expression here.
    // For example, "participants.age * 12"
    // "participants * 12" will use participants' length if it is an array.
    expressionString = expressionString.replace(/:/g, DELIM_VALUE);
    expressionString = expressionString.replace(/\$/g, "");

    let parser = new Parser();

    let expr = parser.parse(expressionString);
    let context = {};
    for (let variable of expr.variables({ withMembers: true })) {
      let escapedVariable = variable.replace(/\./g, DOT_VALUE);
      if (escapedVariable.startsWith("CFF_FULL_")) {
        let variable = escapedVariable.slice("CFF_FULL_".length);
        context[escapedVariable] = parse_number_formula(data, variable, false);
      } else {
        context[escapedVariable] = parse_number_formula(
          data,
          variable,
          numeric
        );
      }
      expressionString = expressionString.replace(
        new RegExp(variable, "g"),
        escapedVariable
      );
    }
    context = { ...context, ...DEFAULT_CONTEXT };
    let price = parser.parse(expressionString).evaluate(context);
    return Math.ceil(price * 100) / 100;
  }
}

export default ExpressionParser;
