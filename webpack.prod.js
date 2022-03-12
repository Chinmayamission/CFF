const merge = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const common = require("./webpack.common.js");
const path = require("path");
const webpack = require("webpack");
const CleanWebpackPlugin = require("clean-webpack-plugin");
var pjson = require("./package.json");
const Critters = require("critters-webpack-plugin");

const FORMBUILDER_URL = "./scripts";
const DEST_URL = FORMBUILDER_URL + "/prod";

const MODE = "prod";
module.exports = merge(common, {
  mode: "production",
  output: {
    path: path.resolve(DEST_URL),
    publicPath: "/",
    filename: `cff.[name].${pjson.version}.js`
  },
  plugins: [
    new CleanWebpackPlugin([DEST_URL]),
    new webpack.DefinePlugin({
      MODE: `"${MODE}"`,
      ENDPOINT_URL: `"https://xpqeqfjgwd.execute-api.us-east-1.amazonaws.com/v2/"`,
      USER_POOL_ID: `"us-east-1_kcpcLxLzn"`,
      COGNITO_CLIENT_ID: `"77mcm1k9ll2ge68806h5kncfus"`,
      GA_TRACKING_ID: `"UA-28518772-9"`,
      // TODO: use a different API key for prod
      GOOGLE_MAPS_API_KEY: `"AIzaSyCkFt0z9cCfaXt6INQGnhXLF7wossqNYUE"`
    }),
    new HtmlWebpackPlugin({
      title: "Chinmaya Forms Framework",
      template: "./scripts/src/index.html",
      filename: `index.${pjson.version}.html`
    }),
    new Critters()
  ]
});
