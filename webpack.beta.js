const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const common = require('./webpack.common.js');
const path = require('path')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin');
// const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
var pjson = require('./package.json');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

const DEST_URL = "./scripts/beta";

const MODE = "beta";
module.exports = version => merge(common, {
  mode: 'production',
  output: {
    path: path.resolve(DEST_URL),
    publicPath: '/',
    filename: `cff.[name].${version}.js`
  },
  plugins: [
    new CleanWebpackPlugin([DEST_URL]),
    new webpack.DefinePlugin({
        MODE: `"${MODE}"`,
        ENDPOINT_URL: `"https://5fd3dqj2dc.execute-api.us-east-1.amazonaws.com/v2/"`
    })
  ]
});