const slsw = require('serverless-webpack');
const webpack = require('webpack');

module.exports = {
    entry: slsw.lib.entries,
    target: 'node',
    mode: slsw.lib.webpack.isLocal ? "development" : "production",
    module: {
        rules: [
            {
                test: [/\.tsx?$/],
                exclude: [/node_modules/, /\.test.tsx?$/],
                use:
                    [
                        {
                            'loader': 'ts-loader'
                        }
                    ]
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            STAGE: `"${slsw.lib.options.stage}"`
        })
    ],
    resolve: {
        modules: ['node_modules', 'scripts'],
        extensions: ['.ts', '.tsx', '.json', '.js', '.jsx']
    },
};