// Bundles expression parser code, which is used by the
// backend API to parse payment expressions.
const path = require("path");
var webpack = require("webpack");
var pjson = require("./package.json");

module.exports = {
  entry: "./scripts/src/common/ExpressionParser.ts",
  output: {
    path: __dirname + "/lambda/chalicelib/dist",
    filename: "ExpressionParser.js",
    libraryTarget: "commonjs2"
  },
  module: {
    rules: [
      {
        test: [/\.ts$/],
        exclude: [/node_modules/, /\.test.tsx?$/],
        use: [
          {
            loader: "ts-loader"
          }
        ]
      }
    ]
  },
  resolve: {
    modules: ["node_modules", "scripts"],
    extensions: [".ts", ".tsx", ".js"]
  },
  target: "node",
  mode: "development"
};
