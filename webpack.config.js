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
        filename: process.env.NODE_ENV === 'production' 
            ? '[name].[contenthash].js' // Use content hash for production builds
            : 'bundle.js',
        chunkFilename: process.env.NODE_ENV === 'production' 
            ? '[name].[contenthash].chunk.js' // Name dynamic chunks in production
            : '[name].chunk.js',
        publicPath: '/', // Use absolute paths to fix SPA routing issues
    },
    // Add performance configuration to control or disable warnings
    performance: {
        hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
        // Increase max asset and entrypoint size before warning
        maxEntrypointSize: 512000, // 500KB
        maxAssetSize: 512000, // 500KB
    },
    // Enable code splitting
    optimization: {
        splitChunks: {
            chunks: 'all',
            minSize: 20000,
            minChunks: 1,
            maxAsyncRequests: 30,
            maxInitialRequests: 30,
            enforceSizeThreshold: 50000,
            cacheGroups: {
                defaultVendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10,
                    reuseExistingChunk: true,
                    name: 'vendors',
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true,
                },
            },
        },
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
                // Copy logo file to the output directory
                { from: 'public/logo.png', to: '' },
                // Copy SEO-related files to the output directory
                { from: 'public/sitemap.xml', to: '' },
                { from: 'public/robots.txt', to: '' },
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
