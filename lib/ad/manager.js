const settings = require('./settings.js')

const debug = require('@ff0000-ad-tech/debug')
var log = debug('DM:lib:ad')

const applyIndexSettings = (config) => {
	const indexSettings = settings.loadSettings(config)
	config.settings = Object.assign({}, config.settings, indexSettings)
}

const applyEnvironment = (config) => {
	config.settings.adParams.environmentId = config.profile.env.id
}

module.exports = {
	applyIndexSettings,
	applyEnvironment
}
