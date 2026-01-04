const merge = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const common = require("./webpack.common.js");
const path = require("path");
const webpack = require("webpack");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const Critters = require("critters-webpack-plugin");

const FORMBUILDER_URL = "./scripts";
const DEST_URL = FORMBUILDER_URL + "/dist";

// Mini build for Docker/Railway deployment
// Environment variables are passed at build time
const MODE = process.env.MODE || "dev";
const USER_POOL_ID = process.env.USER_POOL_ID || "";
const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID || "";
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || "";

module.exports = merge(common, {
  mode: "production",
  output: {
    path: path.resolve(DEST_URL),
    publicPath: "/",
    filename: `cff.[name].[contenthash].js`
  },
  plugins: [
    new CleanWebpackPlugin([DEST_URL]),
    new webpack.DefinePlugin({
      MODE: `"${MODE}"`,
      // API is served from same origin under /api/ path
      ENDPOINT_URL: `"/api/"`,
      USER_POOL_ID: `"${USER_POOL_ID}"`,
      COGNITO_CLIENT_ID: `"${COGNITO_CLIENT_ID}"`,
      GA_TRACKING_ID: `""`,
      GOOGLE_MAPS_API_KEY: `"${GOOGLE_MAPS_API_KEY}"`
    }),
    new HtmlWebpackPlugin({
      title: "Chinmaya Forms Framework",
      template: "./scripts/src/index.html",
      filename: `index.html`
    }),
    new Critters()
  ]
});
