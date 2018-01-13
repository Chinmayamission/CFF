var path = require("path")
var webpack = require('webpack')

const FORMBUILDER_URL = "./scripts";
const SRC_URL = FORMBUILDER_URL + "/src";
const DEST_URL = FORMBUILDER_URL + "/dist";

module.exports = {
  context: __dirname,
// "react-router-dom", 
  entry: {
    app: SRC_URL + '/index', // entry point of our app. assets/ts/index.tsx should require other js modules and dependencies it needs
    vendor: ["react", "react-dom", "react-table", "react-csv", "react-jsonschema-form", "react-responsive-modal", 
    "lodash", "query-string",  "axios", "json-schema-deref-sync"]
  },

  output: {
      path: path.resolve(DEST_URL),
      filename: "[name].js"
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name:"vendor",
      filename:"vendor.bundle.js",
      minChunks: function(module) {
        return isExternal(module);
      }
    })
  ],

  module: {
    loaders: [
        {
            test: /\.tsx?$/,
            exclude: /node_modules/,
            loader: 'ts-loader'
        }, // to transform TSX into JS
        {
          test: /\.s?css$/,
          use: [ 'style-loader', 'css-loader', 'sass-loader' ]
        },
        {
          test: /\.svg$/,
          loader: 'svg-url-loader'
        }
    ]
  },

  resolve: {
    modules: ['node_modules', 'scripts'],
    extensions: ['.ts', '.tsx', '.js']
  },
  node: {
    fs: "empty"
  }
}

function isExternal(module) {
  var context = module.context;

  if (typeof context !== 'string') {
    return false;
  }

  return context.indexOf('node_modules') !== -1;
}