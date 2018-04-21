const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const common = require('./webpack.common.js');
const path = require('path')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin');
// const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
var pjson = require('./package.json');

const FORMBUILDER_URL = "./scripts";
const DEST_URL = FORMBUILDER_URL + "/prod";

const MODE = "prod";
module.exports = merge(common, {
  mode: 'production',
  output: {
    path: path.resolve(DEST_URL)
  },
  // optimization: {
  //   minimizer: [
  //     new OptimizeCSSAssetsPlugin({})
  //   ]
  // },
  output: {
    path: path.resolve(DEST_URL),
    publicPath: '/',
    filename: `[name].${pjson.version}.js`
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: `[name].${pjson.version}.css`
    }),
     new CleanWebpackPlugin([DEST_URL]),
     new HtmlWebpackPlugin({
       filename: `index.${pjson.version}.html`,
       title: 'Chinmaya Forms Framework - ' + MODE,
       template: './scripts/src/index.html',
     }),
    new webpack.DefinePlugin({
      MODE: '"' + MODE + '"'
    })
  ]
});

