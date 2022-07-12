const { readFileSync, writeFileSync } = require("fs");
const { ExpressionParser } = require("./ExpressionParser");

/*
The below code allows the backend (AWS lambda) to this script from the command line.
It is complied by webpack.expressionparser.js and then used by the backend code.

Usage: node ExpressionParser.js calculate-price [path-to-json-file]

The JSON file should have the following contents:
{
    "expressionString": "...",
    "data": {},
    "numeric": true,
    "responseMetadata": {}
}

*/
if (typeof require !== "undefined" && require.main === module) {
  if (process.argv[2] !== "calculate-price") {
    throw Error("Only calculate-price is supported");
  }
  const { expressionString, data, numeric, responseMetadata } = JSON.parse(
    readFileSync(process.argv[3]).toString()
  );
  const OUTPUT_PATH = __dirname + `/output-${Math.random()}.json`;
  writeFileSync(
    OUTPUT_PATH,
    JSON.stringify(
      ExpressionParser.calculate_price(
        expressionString,
        data,
        numeric,
        responseMetadata
      )
    )
  );
  console.log("Result Path: " + OUTPUT_PATH);
}
