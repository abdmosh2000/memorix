const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: process.env.NODE_ENV || 'development', // 'production' or 'development'
    entry: './src/index.js',
// Entry point of your application
    output: {
        path: path.resolve(__dirname, 'dist'), // Output directory
        filename: 'bundle.js', // Output filename
        publicPath: '/', // Important for React Router
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
        new HtmlWebpackPlugin({
            template: './public/index.html', // Use 'public/index.html' as the template
        }),
        new MiniCssExtractPlugin({
            filename: 'styles.css', // Extract CSS into a separate file
        }),
    ],
    resolve: {
        extensions: ['.js', '.jsx'], // Allow importing .js and .jsx files without specifying the extension
        fallback: {
            "path": require.resolve("path-browserify"),
            "util": require.resolve("util/"),
            "stream": require.resolve("stream-browserify"),
            "buffer": require.resolve("buffer/"),
        }
    },
};
