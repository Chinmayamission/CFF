const merge = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const common = require("./webpack.common.js");
var webpack = require("webpack");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const Critters = require("critters-webpack-plugin");

const MODE = "dev";
module.exports = merge(common, {
  devtool: "source-map",
  mode: "development",
  plugins: [
    new BundleAnalyzerPlugin(),
    new webpack.DefinePlugin({
      MODE: `"${MODE}"`,
      ENDPOINT_URL: `"https://5fd3dqj2dc.execute-api.us-east-1.amazonaws.com/v2/"`,
      // ENDPOINT_URL: `"http://localhost:8001/"`,
      // USER_POOL_ID: `"us-east-1_kcpcLxLzn"`,
      // COGNITO_CLIENT_ID: `"77mcm1k9ll2ge68806h5kncfus"`
      USER_POOL_ID: `"us-east-1_U9ls8R6E3"`,
      COGNITO_CLIENT_ID: `"2511g7rmn8p70losdlh9gi9j0"`,
      GA_TRACKING_ID: `""`,
      GOOGLE_MAPS_API_KEY: `"AIzaSyCkFt0z9cCfaXt6INQGnhXLF7wossqNYUE"`
    }),
    new HtmlWebpackPlugin({
      title: "Chinmaya Forms Framework - Dev",
      template: "./scripts/src/index.html",
      filename: `index.html`
    }),
    new Critters()
  ]
});
