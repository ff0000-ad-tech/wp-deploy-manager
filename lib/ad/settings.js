const fs = require('fs')

const redHooks = require('./red-hooks.js')

const debug = require('debug')
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
				settings.runtimeIncludes = processRuntimeIncludes(ad)
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

//
function processRuntimeIncludes(ad) {
	if (!ad.settings.runtimeIncludes) {
		return
	}
	// parse
	var runtimeIncludes = []
	const raw = ad.settings.runtimeIncludes
	const reqs = raw
		.replace(/^[^\{]+\{/, '')
		.replace(/\}[^\}]*/, '')
		.split(',')
	reqs.forEach(req => {
		// context
		const contextVarMatch = raw.match(/return\s+(\S+)/)
		if (contextVarMatch) {
			// request
			const subpath = raw.match(/['"]([^'"]*)['"]/)[1]
			var path
			switch (contextVarMatch[1]) {
				case 'adParams.adPath':
					path = `${ad.paths.ad.context}/${subpath}`
					break
				case 'adParams.corePath':
					path = `${ad.paths.core.context}/${subpath}`
					break
				case 'adParams.commonPath':
					path = `${ad.paths.common.context}/${subpath}`
					break
				case 'adParams.jsPath':
					path = `${ad.paths.common.context}/${ad.paths.common.js}/${subpath}`
					break
			}
			runtimeIncludes.push(path)
		}
	})
	return runtimeIncludes
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
