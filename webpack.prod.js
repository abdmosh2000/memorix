const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

// Force NODE_ENV to be production
process.env.NODE_ENV = 'production';

module.exports = {
    mode: 'production',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.[contenthash].js',
        publicPath: '/',
        clean: true // Clean the output directory before emit
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    format: {
                        comments: false,
                    },
                    compress: {
                        drop_console: true,  // Remove console.log in production
                    }
                },
                extractComments: false,
            }),
        ],
        splitChunks: {
            chunks: 'all',
        },
    },
    module: {
        // rules: [
        //     {
        //         test: /\.(js|jsx)$/,
        //         exclude: /node_modules/,
        //         use: {
        //             loader: 'babel-loader',
        //             options: {
        //                 presets: ['@babel/preset-env', '@babel/preset-react'],
        //             },
        //         },
        //     },
        //     {
        //         test: /\.css$/i,
        //         use: [MiniCssExtractPlugin.loader, 'css-loader'],
        //     },
        //     {
        //         test: /\.(png|svg|jpg|jpeg|gif)$/i,
        //         type: 'asset/resource',
        //     },
        // ],
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
    {
        test: /\.(mp3|wav|ogg)$/i,
        use: [
            {
                loader: 'file-loader',
                options: {
                    name: '[name].[contenthash].[ext]',
                    outputPath: 'assets/sounds/',
                },
            },
        ],
    },
],

    },
    plugins: [
        // Define environment variables that will be available in your React app
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
            'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL || 'https://memorix-backend-wn9o.onrender.com/api'),
        }),
        new HtmlWebpackPlugin({
            template: './public/index.html',
            favicon: './public/favicon.ico',
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true,
            }
        }),
        new MiniCssExtractPlugin({
            filename: 'styles.[contenthash].css',
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'public/apple-touch-icon.png', to: '' },
                { from: 'public/favicon-32x32.png', to: '' },
                { from: 'public/favicon-16x16.png', to: '' },
                { from: 'public/site.webmanifest', to: '' },
                { from: 'public/_redirects', to: '' },
                { from: 'public/200.html', to: '' },
                // Copy SEO-related files to the output directory
                { from: 'public/sitemap.xml', to: '' },
                { from: 'public/robots.txt', to: '' },
                { from: 'static.json', to: '' },
            ],
        }),
        // Add the environment indicator to a debug file
        new webpack.BannerPlugin({
            banner: () => {
                return `
                // Memorix Production Build
                // Build Date: ${new Date().toISOString()}
                // API URL: ${process.env.REACT_APP_API_URL || 'https://memorix-backend-wn9o.onrender.com/api'}
                // NODE_ENV: production
                `;
            }
        })
    ],
    resolve: {
        extensions: ['.js', '.jsx'],
        fallback: {
            "path": require.resolve("path-browserify"),
            "util": require.resolve("util/"),
            "stream": require.resolve("stream-browserify"),
            "buffer": require.resolve("buffer/"),
        }
    },
};
