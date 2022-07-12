// Bundles code required to deploy AWS lambda Google Sheets sync function.
const slsw = require("serverless-webpack");
const webpack = require("webpack");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

module.exports = {
  entry: slsw.lib.entries,
  target: "node",
  mode: slsw.lib.webpack.isLocal ? "development" : "production",
  plugins: [
    new webpack.DefinePlugin({
      STAGE: `"${slsw.lib.options.stage}"`
    }),
    new MonacoWebpackPlugin({
      // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
      languages: ["json", "html"]
    })
  ],
  externals: ["fsevents"],
  module: {
    rules: [
      {
        test: [/\.tsx?$/],
        exclude: [/node_modules/, /\.test.tsx?$/],
        use: [
          {
            loader: "babel-loader"
          },
          {
            loader: "ts-loader"
          }
        ]
      },
      {
        test: /\.s?css$/,
        use: ["file-loader"]
      },
      {
        test: /\.(svg|png|jpg|woff|eot|ttf)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              publicPath: ""
            }
          }
        ]
      }
    ]
  },
  resolve: {
    modules: ["node_modules", "scripts"],
    extensions: [".ts", ".tsx", ".js"]
  },
  node: {
    fs: "empty"
  }
};
