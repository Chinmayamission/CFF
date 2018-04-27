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

const FORMBUILDER_URL = "./scripts";
const DEST_URL = FORMBUILDER_URL + "/prod";

const MODE = "prod";
let prod_named_versions = merge(common, {
  mode: 'production',
  // plugins: [
  //     // new UglifyJsPlugin(/* ... */),
  //     new webpack.DefinePlugin({ "process.env.NODE_ENV": JSON.stringify("production") }),
  //     new webpack.optimize.ModuleConcatenationPlugin(),
  //     new webpack.NoEmitOnErrorsPlugin()
  // ],
  // optimization: {
  //   minimizer: [
  //     new OptimizeCSSAssetsPlugin({})
  //   ]
  // },
  // module: {
  //   rules: [
  //     {
  //       test: /\.s?css$/,
  //       use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'] //['style-loader', 'css-loader', 'sass-loader']
  //     }
  //   ]
  // },
  output: {
    path: path.resolve(DEST_URL),
    publicPath: '/',
    filename: `cff.[name].${pjson.version}.js`
    // filename: `[name].${pjson.version}.js`
  },
  plugins: [
    // new MiniCssExtractPlugin({
    //   filename: `[name].${pjson.version}.css`
    // }),
     new HtmlWebpackPlugin({
        title: 'Chinmaya Forms Framework Admin',
        template: './scripts/src/index.html',
        filename: 'index.html'
        // filename: `index.${pjson.version}.html`
     }),
    new webpack.DefinePlugin({
      MODE: `"${MODE}"`
    })
  ]
});

let prod_not_named_versions = merge(prod_named_versions, {
  mode: 'production',
  output: {
    filename: 'cff.[name].js'
  },
  plugins: [
    new CleanWebpackPlugin([DEST_URL]),
    new webpack.DefinePlugin({
      MODE: `"${MODE}"`
    })
  ]
});

module.exports = [prod_not_named_versions, prod_named_versions];