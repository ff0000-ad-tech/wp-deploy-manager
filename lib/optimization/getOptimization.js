const TerserPlugin = require('terser-webpack-plugin')

module.exports = function getOptimization({ optimize }) {
	if (optimize) {
		return {
			minimize: true,
			minimizer: [
				new TerserPlugin({
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
