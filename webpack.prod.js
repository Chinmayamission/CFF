const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const common = require('./webpack.common.js');
const path = require('path')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin');

const FORMBUILDER_URL = "./scripts";
const DEST_URL = FORMBUILDER_URL + "/prod";

module.exports = merge(common, {
  mode: 'production',
  output: {
    path: path.resolve(DEST_URL),
    filename: "[name].js"
  },
  plugins: [
     new CleanWebpackPlugin([DEST_URL]),
     new HtmlWebpackPlugin({
       title: 'Production',
       // template: './scripts/src/index.html',
     })
  ]
});

