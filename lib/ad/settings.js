const fs = require('fs')

const requireFromString = require('require-from-string')

const hooksRegex = require('@ff0000-ad-tech/hooks-regex')

const debug = require('@ff0000-ad-tech/debug')
const log = debug('DM:ad:settings')

// read settings hook
const loadSettings = (config) => {
	const index = fs.readFileSync(`${config.source.path}`, 'utf8')
	return readSettings(index)
}

// define expected model with the hook-ids
const INDEX_HOOKS = {
	adParams: 'ad_params',
	assets: 'assets'
}
const readSettings = (source) => {
	var settings = {}
	for (var key in INDEX_HOOKS) {
		var matches = source.match(hooksRegex.get('Red', 'Settings', INDEX_HOOKS[key]))
		if (matches) {
			// settings hooks can be parsed with a little node-require trickery
			settings[key] = requireFromString(`${matches.groups.content} module.exports = ${key};`)
		}
	}
	return settings
}

module.exports = {
	loadSettings
}
