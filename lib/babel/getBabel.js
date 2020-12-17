module.exports = function getBabel({ DM, imageIncludes, fontIncludes, base64Inline }) {
	const loaders = [
		// js
		{
			test: /\.jsx?$/,
			use: [
				{
					loader: 'babel-loader',
					options: {
						presets: [
							[
								'@babel/preset-env',
								{
									useBuiltIns: 'usage', // alternative mode: "entry"
									corejs: 3, // default would be 2
									loose: true
									// targets: '> 0.25%, not dead'
									// // set your own target environment here (see Browserslist)
								}
							]
						],
						plugins: [
							'@babel/plugin-proposal-class-properties',
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
