const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const common = require('./webpack.common.js');
const path = require('path')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin');

const FORMBUILDER_URL = "./scripts";
const SRC_URL = FORMBUILDER_URL + "/src";
const DEST_URL = FORMBUILDER_URL + "/dist";

module.exports = merge(common, {
  // module: {
  //   loaders: [
  //     {
  //       test: /\.s?css$/,
  //       use: ExtractTextPlugin.extract({
  //         fallback: "style-loader",
  //         use: ['css-loader', 'sass-loader'],
  //       }),
  //     },
  //   ],
  // },
 plugins: [
   new CleanWebpackPlugin([DEST_URL]),
   new UglifyJSPlugin(),
   // new ExtractTextPlugin("main.css"),
   new webpack.DefinePlugin({
     'process.env': {
       'NODE_ENV': '"production"',
     },
   }),
 ],
});
