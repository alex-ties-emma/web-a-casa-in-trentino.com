const {VueLoaderPlugin} = require('vue-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
require('dotenv').config({path: '.env'});
const webpack = require("webpack");

const path = require('path');
const fs = require('fs');
const entryDir = path.resolve(__dirname, '../assets/script');
const entries = fs.readdirSync(entryDir);
const entryMap = {};

entries.filter(entry => (entry.endsWith('.js'))).forEach(function (entry) {
    const stat = fs.statSync(entryDir + '/' + entry);
    if (stat && !stat.isDirectory()) {
        const name = entry.replace('.js', '');
        entryMap[name] = entryDir + '/' + entry;
    }
});

module.exports = {
    mode: process.env.NODE_ENV,
    entry: entryMap,
    output: {
        filename: '../public/script/[name].bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.(?:js|mjs|cjs)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', { targets: "defaults" }]
                        ],
                        plugins: [
                        ]
                    }
                }
            },

            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin()
    ],
    resolve: {
        alias: {
            'js': path.resolve(__dirname, '../assets/script')
        },
    },
    optimization: {
        minimize: true,
    },


};