const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = function getOptimization({ optimize }) {
	if (optimize) {
		return {
			minimizer: [
				new UglifyJsPlugin({
					uglifyOptions: {
						compress: {
							reduce_funcs: false,
							drop_console: true
						}
					},
					sourceMap: false
				})
			]
		}
	} else {
		return {}
	}
}
