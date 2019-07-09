import {Parser} from "expr-eval";
import {isArray} from "lodash";
const DELIM_VALUE = "ASFASFSDF";
const SPACE_VALUE = "SDSDGSDFS";
const DOT_VALUE = "ADKLFJSFL";

export module ExpressionParser {
    export function dict_array_to_sum_dict(original, key_value_eq=null) {
        /*
        Converts array of dictionaries to a single dictionary consisting of the sum.
        >>> dict_array_to_sum_dict([{"a":2, "b":5}, {"a":1, "b":6}]) 
        {'a': 3.00, 'b': 11.00}
        */
        let dict = {};
        for (let d of original) {
            for (let k in d) {
                let v = d[k];
                if (String(v) == String(key_value_eq)) {
                    dict[k] = dict[k] ? dict[k] + 1 : 1;
                }
                else if (!isNaN(v) && key_value_eq === null) {
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
                val = dict_array_to_sum_dict(val, key_value_eq)[key]
            }
            else {
                val = val ? val[key] : 0;
            }
        }
        return val
    }
    function parse_number_formula(data, variable, numeric=true) {
        variable = variable.replace(new RegExp(SPACE_VALUE, 'g'), " ");
        let key_value_eq = null;
        // console.log(variable);
        
        if (~variable.indexOf(DELIM_VALUE)) {
            [variable, key_value_eq] = variable.split(DELIM_VALUE);
        }
        let value = null;
        value = deep_access_list(data, variable.trim().split("."), key_value_eq);
        if (numeric) {
            if (!value) { // not entered yet.
                return 0;
            }
            if (value && isArray(value)) { // If value is an array, make it numeric.
                if (key_value_eq) {
                    value = value.filter(v => String(v).trim() === key_value_eq.trim()).length;
                }
                else {
                    value = value.length;
                }
            }
            if (typeof value === "string" && key_value_eq) { // check for equality of strings.
                value = (value.trim() === key_value_eq.trim());
            }
            if (typeof value === "boolean") {
                value = value ? 1 : 0;
            }
            if (isNaN(value)) {
                value = 0;
                // throw "Key " + variable + " is not numeric";
            }
            else {
                value = parseFloat(value) || 0;
            }
            return Math.round(value * 100) / 100;
        }
        else {
            return value;
        }
    }
    export function calculate_price(expressionString, data, numeric=true) {
        // Analogous to the python calculate_price lambda function; parses the expression here.
        // For example, "participants.age * 12"
        // "participants * 12" will use participants' length if it is an array.
        expressionString = expressionString.replace(/:/g, DELIM_VALUE);

        let quotedStrings = expressionString.match('(\'.+?\')');
        if (quotedStrings) {
            for (let i = 0; i < quotedStrings.length; i++) {
                let quoted_string = quotedStrings[i];
                let replaced = quoted_string.replace(/ /g, SPACE_VALUE).replace(/\'/g, "");
                expressionString = expressionString.replace(quoted_string, replaced);
            }
        }
        expressionString = expressionString.replace(/\$/g, "");
        
        let parser = new Parser();
        
        let expr = parser.parse(expressionString);
        let context = {};
        for (let variable of expr.variables({withMembers: true})) {
            context[variable.replace(/\./g, DOT_VALUE)] = parse_number_formula(data, variable, numeric);
        }
        return parser.parse(expressionString.replace(/\./g, DOT_VALUE)).evaluate(context);

    }
}

export default ExpressionParser;