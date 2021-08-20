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
								'@babel/preset-env',
								{
									useBuiltIns: 'usage', // important! requires .browserslistrc, alternative mode: "entry"
									corejs: 3, // default would be 2
									loose: true,
									modules: 'commonjs' // suppresses warning for esm modules not exporting default
									// targets: '> 0.25%, not dead'
									//  - set your own target environment here, or in .browserslistrc (see Browserslist)
								}
							]
						],
						plugins: [
							['@babel/plugin-transform-arrow-functions'],
							['@babel/plugin-proposal-class-properties', { loose: true }],
							['@babel/plugin-proposal-private-methods', { loose: true }],
							['@babel/plugin-proposal-private-property-in-object', { loose: true }],
							['babel-plugin-transform-async-to-promises'],
							['@babel/plugin-proposal-object-rest-spread', { loose: true }],
							['@babel/plugin-transform-block-scoping'],
							// 'dynamic-import-webpack',
							// '@babel/plugin-syntax-dynamic-import',
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
