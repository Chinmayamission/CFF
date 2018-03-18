const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack')

const FORMBUILDER_URL = "./scripts";
const SRC_URL = FORMBUILDER_URL + "/src";
const DEST_URL = FORMBUILDER_URL + "/dist";

module.exports = {
  entry: {
    app: SRC_URL + '/index', // entry point of our app. assets/ts/index.tsx should require other js modules and dependencies it needs
 /*vendor: ["react", "react-dom", "react-table", "react-csv", "react-jsonschema-form", "react-responsive-modal",
            "lodash", "query-string",  "axios", "json-schema-deref-sync"]
  */},
 plugins: [
   new HtmlWebpackPlugin({
     title: 'Production',
     // template: './scripts/src/index.html',
   }),
   new webpack.optimize.CommonsChunkPlugin({
     name:"vendor",
     filename:"vendor.bundle.js",
     minChunks: function(module) {
       return isExternal(module);
     }
   })
 ],
 output: {
     path: path.resolve(DEST_URL),
     filename: "[name].js"
 },
 module: {
   loaders: [
       {
           test: /\.tsx?$/,
           exclude: /node_modules/,
           loader: 'ts-loader'
       },
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
};

function isExternal(module) {
  var context = module.context;

  if (typeof context !== 'string') {
    return false;
  }

  return context.indexOf('node_modules') !== -1;
}
