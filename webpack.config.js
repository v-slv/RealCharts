const path = require('path');

module.exports = {
    entry: path.join(__dirname, '/src/RealCharts.ts'),
    mode: 'development',
    target: 'web',
    output: {
        filename: 'dist/realcharts.js',
        path: __dirname,
        library: 'libtest'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
};
