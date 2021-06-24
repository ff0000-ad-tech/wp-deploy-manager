const path = require('path')

const fbaCompiler = require('@ff0000-ad-tech/fba-compiler')
const imageIncludes = fbaCompiler.types.FBA_IMAGES.include
const fontIncludes = fbaCompiler.types.FBA_FONTS.include

const debug = require('@ff0000-ad-tech/debug')
const { paths } = require('traverse')
var log = debug('DM:lib:babel')

module.exports = function getBabel({ base64Inline }) {
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
							'@babel/plugin-proposal-class-properties',
							['@babel/plugin-proposal-private-methods', { loose: false }],
							// '@babel/plugin-proposal-object-rest-spread',
							// 'dynamic-import-webpack',
							// '@babel/plugin-syntax-dynamic-import',
							// '@babel/plugin-transform-block-scoping',
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
			test: [].concat(imageIncludes).concat(fontIncludes),
			use: [
				{
					loader: '@ff0000-ad-tech/fba-loader',
					options: {
						emitFile: false,
						base64Inline,
						imageTypes: imageIncludes,
						fontTypes: fontIncludes
					}
				}
			]
		}
	]
	return loaders
}
