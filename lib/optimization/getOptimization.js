const TerserPlugin = require('terser-webpack-plugin')

module.exports = function getOptimization({ optimize }) {
	if (optimize) {
		return {
			minimizer: [
				new TerserPlugin({
					sourceMap: false,
					terserOptions: {
						compress: {
							drop_console: true
						}
					}
				})
			]
		}
	} else {
		return {}
	}
}
