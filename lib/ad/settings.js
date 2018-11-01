const fs = require('fs')

const redHooks = require('./red-hooks.js')

const debug = require('@ff0000-ad-tech/debug')
var log = debug('DM:ad:settings')

/* -- PULL ----
 *
 *
 *
 */
// read each hook source
function refresh(ad) {
	var settings

	// load external settings
	const data = loadExternalSettings(ad.settings.source.path)
	if (data) {
		switch (ad.settings.source.type) {
			// ff0000-ad-tech
			case 'hooks':
				settings = redHooks.readSettings(data)
				break

			// alternative settings management systems
			case 'json':
				settings = JSON.parse(data)
				break
			default:
		}
	}
	return settings
}

// load settings source
function loadExternalSettings(path) {
	try {
		return fs.readFileSync(path, 'utf8')
	} catch (err) {
		log(err)
	}
}

/* -- PUSH ----
 *
 *
 *
 */
function push(ad, source) {
	log('push ad to source')
	log(ad.settings.res)
}

module.exports = {
	refresh,
	push
}
