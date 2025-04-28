const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
module.exports = {
    mode: process.env.NODE_ENV || 'development', // 'production' or 'development'
    entry: './src/index.js',
// Entry point of your application
    output: {
        path: path.resolve(__dirname, 'dist'), // Output directory
        filename: 'bundle.js', // Output filename
        publicPath: '/', // Use absolute paths to fix SPA routing issues
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'), // Serve static files from 'public'
        },
        historyApiFallback: true, // Enable SPA routing
        port: 3000, // Development server port
        hot: true, // Enable hot module replacement
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                    },
                },
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
        ],
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
        new HtmlWebpackPlugin({
            template: './public/index.html', // Use 'public/index.html' as the template
            favicon: './public/favicon.ico', // Specify the favicon explicitly
        }),
        new MiniCssExtractPlugin({
            filename: 'styles.css', // Extract CSS into a separate file
        }),
        new CopyWebpackPlugin({
            patterns: [
                // Copy favicon files to the output directory
                { from: 'public/apple-touch-icon.png', to: '' },
                { from: 'public/favicon-32x32.png', to: '' },
                { from: 'public/favicon-16x16.png', to: '' },
                { from: 'public/site.webmanifest', to: '' },
                { from: 'public/_redirects', to: '' },
                { from: 'public/200.html', to: '' },
                // Copy the static.json file for hosting services
                { from: 'static.json', to: '' },
            ],
        }),
    ],
    resolve: {
        extensions: ['.js', '.jsx'], // Allow importing .js and .jsx files without specifying the extension
        fallback: {
            "path": require.resolve("path-browserify"),
            "process": require.resolve("process/browser"),
            "util": require.resolve("util/"),
            "stream": require.resolve("stream-browserify"),
            "buffer": require.resolve("buffer/"),
        }
    },
};
