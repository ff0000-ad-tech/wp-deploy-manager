const rollupUrlPlugin = require('rollup-plugin-url')
const cjsPlugin = require('rollup-plugin-commonjs')

/**
 * To allow Rollup to tree shake effectively while allowing code written
 * for Babel plugins in mind (e.g. transform-class-properties),
 * apply Babel plugins pre-Rollup thru the babel-loader
 * then transpiling thru env preset post-Rollup thru webpack-rollup-babel-loader
 */
module.exports = function getProductionBabel({ DM, babelOptions = {}, imageIncludes, fontIncludes }) {
	/**
	 * Util for creating Rollup Babel loader entries
	 */
	const rollupBabelUseEntry = (options = {}) => ({
		loader: 'webpack-rollup-babel-loader',
		options: Object.assign(
			{
				babelOptions: {
					presets: babelOptions.presets
				},
				plugins: [
					cjsPlugin({
						include: '**',
						extensions: [].concat(imageIncludes).concat(fontIncludes)
					})
				]
			},
			options
		)
	})

	const babelLoaders = [
		// pre-Rollup Babel (plugins)
		{
			test: /\.js$/,
			use: [
				{
					loader: 'babel-loader',
					options: {
						plugins: babelOptions.plugins
					}
				}
			]
		},
		// rollup loader to generate smaller bundle, use one entry point
		// build.bundle.js
		{
			test: /build\.js$/,
			use: [
				rollupBabelUseEntry({
					globals: {
						'ad-load': 'adLoad'
					},
					external: ['ad-load']
				})
			]
		},
		// initial.bundle.js
		{
			test: req => {
				const isAdEntryIndex = req.includes('ad-entry') && req.endsWith('index.js')
				return isAdEntryIndex
			},
			use: [
				rollupBabelUseEntry({
					globals: {
						'ad-load': 'adLoad'
					},
					external: ['ad-load']
				})
			]
		},
		// inline.bundle.js
		{
			test: /\.inline-imports\.js/,
			use: [rollupBabelUseEntry()]
		}
	]

	return babelLoaders
}
