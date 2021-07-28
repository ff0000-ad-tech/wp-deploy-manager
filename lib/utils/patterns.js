const debug = require('@ff0000-ad-tech/debug')
const log = debug('DM:utils:patterns')

module.exports = {
	IMAGES: /\.(png|jpg|gif|svg)(\?.*)?$/,
	FONTS: /\.(ttf|woff)(\?.*)?$/
}
