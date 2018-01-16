import {Parser} from "expr-eval";
import {get} from "lodash-es";

export module ExpressionParser {
    export function parse(expressionString, data) {
        // Analogous to the python calculate_price lambda function; parses the expression here.
        // For example, "participants.age * 12"
        // "participants * 12" will use participants' length if it is an array.
        let parser = new Parser();
        console.log(expressionString);
        let expr = parser.parse(expressionString);
        let context = {};
        for (let variable of expr.variables()) {
            let variableOrig = variable;
            if (variable[0] == "$") variable = variable.substring(1);
            let value = get(data, variable);
            
            if (value && value.length) { // If value is a length, make it numeric.
                value = value.length;
            }
            if (isNaN(value)) {
                throw "Key " + variable + " is not numeric";
            }
            else {
                value = parseFloat(value);
            }
            context[variableOrig] = value;
        }
        return expr.evaluate(context);

    }
}

export default ExpressionParser;