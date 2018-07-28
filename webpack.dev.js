const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const common = require('./webpack.common.js');
var webpack = require('webpack')

const MODE = "dev";
module.exports = merge(common, {
 devtool: 'source-map',
 mode: 'development',
 plugins: [
    new webpack.DefinePlugin({
        MODE: `"${MODE}"`,
        ENDPOINT_URL: `"http://localhost:8001/"`,
        USER_POOL_ID: `"us-east-1_U9ls8R6E3"`,
        COGNITO_CLIENT_ID: `"2511g7rmn8p70losdlh9gi9j0"`
    })
 ]
});
