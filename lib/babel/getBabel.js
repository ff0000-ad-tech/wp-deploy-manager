const { IMAGES, FONTS } = require('../utils/patterns.js')

const debug = require('@ff0000-ad-tech/debug')
const log = debug('DM:babel')

module.exports = function getBabel() {
	const loaders = [
		// js
		{
			test: /\.jsx?$/,
			use: [
				{
					loader: 'babel-loader',
					options: {
						sourceType: 'unambiguous',
						presets: [
							[
								//
								// https://babeljs.io/docs/en/babel-preset-env
								//
								'@babel/preset-env',
								{
									useBuiltIns: 'usage', // alleviates need to import core-js and regenerator runtime
									// .browserslistrc gives users the ability to flex this per project requirements
									// NOTE: _the rc file needs to be in the webpack CWD_
									//
									// targets: {
									// 	browsers: [
									// 		'> 0.75%',
									// 		'not IE 11'
									// 	]
									// },
									corejs: 3, // default would be 2
									loose: true,
									modules: 'commonjs' // suppresses warning for esm modules not exporting default
								}
							]
						],
						plugins: [
							// ['babel-plugin-transform-async-to-promises'], // promise-polyfill dist is smaller than async/await
							['@babel/plugin-proposal-object-rest-spread', { loose: false }],
							['@babel/plugin-proposal-class-properties', { loose: true }],
							// ['@babel/plugin-proposal-private-methods', { loose: true }],
							// ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
							// ['@babel/plugin-transform-classes'],
							// ['@babel/plugin-transform-spread'],
							// ['@babel/plugin-transform-parameters'],
							// ['@babel/plugin-transform-arrow-functions'],
							// ['@babel/plugin-transform-block-scoping'],
							[
								'@babel/plugin-transform-react-jsx',
								{
									pragma: 'h',
									pragmaFrag: 'Fragment'
								}
							]
						]
					}
				}
			]
		},
		// css
		{
			test: /\.scss$/,
			use: [
				{
					loader: 'style-loader' // creates style nodes from JS strings
				},
				{
					loader: 'css-loader', // translates CSS into JS-strings
					options: {
						sourceMap: false
						// esModule: false
					}
				},
				{
					loader: 'sass-loader' // compiles Sass to CSS
				}
			]
		},
		// loads images and fonts
		{
			test: [IMAGES, FONTS],
			use: [
				{
					loader: '@ff0000-ad-tech/fba-loader',
					options: {
						imageTypes: IMAGES,
						fontTypes: FONTS
					}
				}
			]
		}
	]
	return loaders
}
