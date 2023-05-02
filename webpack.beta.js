const merge = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const common = require("./webpack.common.js");
const path = require("path");
const webpack = require("webpack");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const Critters = require("critters-webpack-plugin");

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
      new webpack.DefinePlugin({
        MODE: `"${MODE}"`,
        ENDPOINT_URL: `"https://5fd3dqj2dc.execute-api.us-east-1.amazonaws.com/v2/"`,
        USER_POOL_ID: `"us-east-1_U9ls8R6E3"`,
        COGNITO_CLIENT_ID: `"2511g7rmn8p70losdlh9gi9j0"`,
        GA_TRACKING_ID: `"UA-28518772-10"`,
        GOOGLE_MAPS_API_KEY: `"AIzaSyAIJZv8VKMaV_ckEPGtQ48CZiI5z5E1rCw"`
      }),
      new HtmlWebpackPlugin({
        title: "Chinmaya Forms Framework - Beta",
        template: "./scripts/src/index.html",
        // filename: 'index.html'
        filename: `index.${version}.html`
      }),
      new Critters()
    ]
  });
