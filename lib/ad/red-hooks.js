const hooksRegex = require('@ff0000-ad-tech/hooks-regex')
const requireFromString = require('require-from-string')

const debug = require('@ff0000-ad-tech/debug')
var log = debug('red-hooks')

// define expected model with the hook-ids
var hooks = {
	adParams: 'ad_params',
	assets: 'assets',
	environments: 'environments',
	externalIncludes: 'external_includes'
}

function readSettings(source, deploy) {
	var settings = {}
	for (var key in hooks) {
		var matches = source.match(hooksRegex.get('Red', 'Settings', hooks[key]))
		if (matches) {
			// settings hooks can be parsed with a little node-require trickery
			settings[key] = requireFromString(`${matches.groups.content} module.exports = ${key};`)
		}
	}
	return settings
}

module.exports = {
	readSettings
}
