/* Just run regular Babel loaders in debug to speed up watch process */
module.exports = function getDebugBabel({ DM, babelOptions = {} }) {
	const loaders = [
		{
			test: /\.jsx?$/,
			use: [
				{
					loader: 'babel-loader',
					options: babelOptions
				}
			]
		}
	]
	return loaders
}
