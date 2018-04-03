const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const common = require('./webpack.common.js');
var webpack = require('webpack')

const MODE = "beta";
module.exports = merge(common, {
 devtool: 'source-map',
 mode: 'development',
 plugins: [
    new webpack.DefinePlugin({
        MODE: '"' + MODE + '"'
    }),
    new HtmlWebpackPlugin({
        title: 'Chinmaya Forms Framework - ' + MODE,
        template: './scripts/src/index.html',
    })
 ]
});
