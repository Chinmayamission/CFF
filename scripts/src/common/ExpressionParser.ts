import { Parser } from "expr-eval";
import { isArray } from "lodash";
import moment from "moment";
import mingo from "mingo";
import { IResponse } from "../store/responses/types";

const DELIM_VALUE = "ASFASFSDF";
const SPACE_VALUE = "SDSDGSDFS";
const DOT_VALUE = "ADKLFJSFL";
const DELIM_VALUE_REGEXP = new RegExp(DELIM_VALUE, "g");
const SPACE_VALUE_REGEXP = new RegExp(SPACE_VALUE, "g");
const DOT_VALUE_REGEXP = new RegExp(DOT_VALUE, "g");

const compare = (v, key_value_eq) => {
  return String(v).trim() === String(key_value_eq).trim();
};

const createDefaultContext = (numeric, responseMetadata) => ({
  cff_yeardiff: (datestr1, datestr2) => {
    if (!datestr1 || !datestr2) {
      return 0;
    }
    const d1 = moment(datestr1, "YYYY-MM-DD");
    const d2 = moment(datestr2, "YYYY-MM-DD");
    return d1.diff(d2, "years");
  },
  cff_countArray: (array, expression) => {
    if (!array || !isArray(array)) {
      return 0;
    }
    return array.filter(item =>
      ExpressionParser.calculate_price(
        expression,
        item,
        numeric,
        responseMetadata
      )
    ).length;
  },
  cff_createdBetween: (datestr1, datestr2) => {
    // Required as a workaround because the "." in ".000Z" is replaced by DOT_VALUE,
    // and ":" is replaced by DELIM_VALUE, in initial parsing.
    datestr1 = datestr1
      .replace(DELIM_VALUE_REGEXP, ":")
      .replace(DOT_VALUE_REGEXP, ".");
    datestr2 = datestr2
      .replace(DELIM_VALUE_REGEXP, ":")
      .replace(DOT_VALUE_REGEXP, ".");

    const date_created =
      moment(
        responseMetadata.date_created && responseMetadata.date_created.$date
      ) || moment();
    const date1 = moment(datestr1);
    const date2 = moment(datestr2);
    return date_created >= date1 && date_created <= date2;
  }
});
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
        return value || 0;
      } else {
        value = parseFloat(value) || 0;
      }
      return value || 0;
    } else {
      return value || 0;
    }
  }

  interface IResponseMetadata {
    [e: string]: any;
  }

  export function calculate_price(
    expressionString,
    data,
    numeric = true,
    responseMetadata: IResponseMetadata = {}
  ) {
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
        context[escapedVariable] = parse_number_formula(data, variable);
      }
      expressionString = expressionString.replace(
        new RegExp(variable, "g"),
        escapedVariable
      );
    }
    context = {
      ...context,
      ...createDefaultContext(numeric, responseMetadata)
    };
    let price = parser.parse(expressionString).evaluate(context);
    if (!numeric) {
      return price;
    }
    return Math.ceil(price * 100) / 100;
  }

  export function performMongoQuery(data, { queryType, queryValue }) {
    if (queryType === "aggregate") {
      const agg = new mingo.Aggregator(queryValue);
      const collection = [data];
      const result = agg.run(collection);
      if (!result || !result[0] || !result[0]["n"]) {
        return result;
      }
      return result[0]["n"];
    }
  }
}

export default ExpressionParser;
