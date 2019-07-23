const merge = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const common = require("./webpack.common.js");
const path = require("path");
const webpack = require("webpack");
const CleanWebpackPlugin = require("clean-webpack-plugin");
// const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
var pjson = require("./package.json");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

const DEST_URL = "./scripts/beta";

const MODE = "beta";
module.exports = version =>
  merge(common, {
    mode: "production",
    output: {
      path: path.resolve(DEST_URL),
      publicPath: "/",
      filename: `cff.[name].${version}.js`
    },
    plugins: [
      new CleanWebpackPlugin([DEST_URL]),
      new HtmlWebpackPlugin({
        title: "Chinmaya Forms Framework - Beta",
        template: "./scripts/src/index.html",
        // filename: 'index.html'
        filename: `index.${version}.html`
      }),
      new webpack.DefinePlugin({
        MODE: `"${MODE}"`,
        ENDPOINT_URL: `"https://forms.beta.chinmayamission.com/api/"`,
        USER_POOL_ID: `"us-east-1_U9ls8R6E3"`,
        COGNITO_CLIENT_ID: `"2511g7rmn8p70losdlh9gi9j0"`,
        GA_TRACKING_ID: `"UA-28518772-10"`
      })
    ]
  });
