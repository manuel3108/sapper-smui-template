const webpack = require('webpack');
const config = require('sapper/config/webpack.js');
const pkg = require('./package.json');

const mode = process.env.NODE_ENV;
const dev = mode === 'development';

const extensions = ['.mjs', '.js', '.json', '.svelte', '.html'];
const mainFields = ['svelte', 'module', 'browser', 'main'];

const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const sassOptions = {
  includePaths: [
    './theme',
    './node_modules',
  ]
};

module.exports = {
	client: {
		entry: config.client.entry(),
		output: config.client.output(),
		resolve: { 
			extensions, 
			mainFields, 
		},
		module: {
			rules: [
				{
					test: /\.(svelte|html)$/,
					use: {
						loader: 'svelte-loader',
						options: {
							dev,
							hydratable: true,
							hotReload: false // pending https://github.com/sveltejs/svelte/issues/2377
						}
					}
				},
				{
					test: /\.(sa|sc|c)ss$/,
					use: [
						'style-loader',
						MiniCssExtractPlugin.loader,
						'css-loader',
						{
							loader: 'sass-loader',
							options: {
								sassOptions
							},
						},
					],
				}
			]
		},
		mode,
		plugins: [
			// pending https://github.com/sveltejs/svelte/issues/2377
			// dev && new webpack.HotModuleReplacementPlugin(),
			new webpack.DefinePlugin({
				'process.browser': true,
				'process.env.NODE_ENV': JSON.stringify(mode)
			}),
			new MiniCssExtractPlugin({
				filename: '[name].css',
				chunkFilename: '[name].[id].css',
			}),
			new OptimizeCssAssetsPlugin({
				assetNameRegExp: /\.css$/g,
				cssProcessor: require('cssnano'),
				cssProcessorPluginOptions: {
					preset: ['default', { discardComments: { removeAll: true } }],
				},
				canPrint: true
			})
		].filter(Boolean),
		devtool: dev && 'inline-source-map'
	},

	server: {
		entry: config.server.entry(),
		output: config.server.output(),
		target: 'node',
		resolve: { 
			extensions, 
			mainFields,
    },
		externals: Object.keys(pkg.dependencies).concat('encoding'),
		module: {
			rules: [
				{
					test: /\.(svelte|html)$/,
					use: {
						loader: 'svelte-loader',
						options: {
							css: false,
							generate: 'ssr',
							dev
						}
					}
				},
				{
					test: /\.(sa|sc|c)ss$/,
					use: [
						'style-loader',
						MiniCssExtractPlugin.loader,
						'css-loader',
						{
							loader: 'sass-loader',
							options: {
								sassOptions
							},
						},
					],
				}
			]
		},
		mode: process.env.NODE_ENV,
		plugins: [
			new MiniCssExtractPlugin({
				filename: '[name].css',
				chunkFilename: '[name].[id].css',
			}),
			new OptimizeCssAssetsPlugin({
				assetNameRegExp: /\.css$/g,
				cssProcessor: require('cssnano'),
				cssProcessorPluginOptions: {
					preset: ['default', { discardComments: { removeAll: true } }],
				},
				canPrint: true
			})
		].filter(Boolean),
		performance: {
			hints: false // it doesn't matter if server.js is large
		}
	},

	serviceworker: {
		entry: config.serviceworker.entry(),
		output: config.serviceworker.output(),
		mode: process.env.NODE_ENV
	}
};