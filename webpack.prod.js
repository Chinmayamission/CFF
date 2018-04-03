const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const common = require('./webpack.common.js');
const path = require('path')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin');

const FORMBUILDER_URL = "./scripts";
const DEST_URL = FORMBUILDER_URL + "/prod";

const MODE = "prod";
module.exports = merge(common, {
  mode: 'production',
  output: {
    path: path.resolve(DEST_URL)
  },
  plugins: [
     new CleanWebpackPlugin([DEST_URL]),
     new HtmlWebpackPlugin({
       filename: 'index.[chunkhash].html',
       title: 'Chinmaya Forms Framework - ' + MODE,
       template: './scripts/src/index.html',
     }),
    new webpack.DefinePlugin({
      MODE: '"' + MODE + '"'
    })
  ]
});

