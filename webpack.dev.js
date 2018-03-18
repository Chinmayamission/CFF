const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
 devtool: 'inline-source-map',
 devServer: {
   contentBase: './scripts/dist',
   proxy: {
     "/": "http://localhost:8000"
   },
   hot: true,
 }
});
