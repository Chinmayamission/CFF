const path = require('path');
var webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
var pjson = require('./package.json');
var HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

const FORMBUILDER_URL = "./scripts";
const SRC_URL = FORMBUILDER_URL + "/src";
const DEST_URL = FORMBUILDER_URL + "/dist";

module.exports = {
  entry: {
    app: ["babel-polyfill", SRC_URL + '/app']
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor.bundle",
          chunks: "initial"
        }
      }
    }
  },
  output: {
    path: path.resolve(DEST_URL),
    publicPath: '/',
    filename: "[name].[chunkhash].js"
  },
  plugins: [
    new HardSourceWebpackPlugin(),
    // new MiniCssExtractPlugin({
    //   filename: "[name].[contenthash].css"
    // }),
    new webpack.DefinePlugin({
      VERSION: `"${pjson.version}"`
    }),
    new HtmlWebpackPlugin({
      title: 'Chinmaya Forms Framework Admin',
      template: './scripts/src/index.html',
      filename: "index.html"
    }),
    new HtmlWebpackPlugin({
        title: 'Chinmaya Forms Framework Form',
        template: './scripts/src/form.html',
        filename: "form.html"
    })
  ],
  module: {
    rules: [
      {
        test: [/\.tsx?$/],
        exclude: [/node_modules/, /\.test.tsx?$/],
        // exclude: [/node_modules/, /\.test.tsx?$/],
        // exclude: [/node_modules\/(?!(json-schema-deref-sync)\/).*/, /\.test.tsx?$/],
        // exclude: /node_modules\/(?![module1|module2])/
        use:
          [
            {
              'loader': 'babel-loader',
              options: {
                "cacheDirectory": true,
                "presets": [
                  ["env", {
                    "targets": {
                      "browsers": [
                        "Explorer 11",
                        "> 5%"
                      ]
                    }
                  }]
                ],
                plugins: [require("babel-plugin-transform-class-properties"), require("babel-plugin-transform-es2015-arrow-functions"), require("babel-plugin-transform-es3-member-expression-literals"), require("babel-plugin-transform-es3-property-literals")]
                // plugins: ["@babel/plugin-transform-template-literals"]
              }
            },
            {
              'loader': 'ts-loader'
            }
          ]
      },
      {
        test: /\.s?css$/,
        use: ['style-loader', 'css-loader', 'sass-loader'] //['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(svg|woff|eot|ttf)$/,
        use: {
          loader: "url-loader",
          options: {
            // limit: 50000,
          },
        },
      }
    ]
  },
  resolve: {
    modules: ['node_modules', 'scripts'],
    extensions: ['.ts', '.tsx', '.js']
  },
  node: {
    fs: "empty"
  },
  mode: 'development'
};