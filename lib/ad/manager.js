const settings = require('./settings.js')

const debug = require('@ff0000-ad-tech/debug')
var log = debug('DM:ad')

const applyIndexSettings = (scope, deploy) => {
	const indexSettings = settings.loadSettings(scope, deploy)
	deploy.settings = Object.assign({}, deploy.settings, indexSettings)
}

const applyEnvironment = (deploy) => {
	deploy.settings.adParams.environmentId = deploy.profile.env.id
}

module.exports = {
	applyIndexSettings,
	applyEnvironment
}
