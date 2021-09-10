const _ = require('lodash')
const normalizeUrl = require('normalize-url')
const indexSettings = require('@ff0000-ad-tech/index-settings')

const debug = require('@ff0000-ad-tech/debug')
var log = debug('DM:ad')

const applyIndexSettings = async (scope, deploy) => {
	const settings = await indexSettings.load(`${scope}/${deploy.source.path}`)
	return _.merge({}, settings, deploy.settings)
}

const applyEnvironment = (deploy) => {
	const assetsRunPath = {}
	// NOTE: preloaders get bundled inline
	assetsRunPath.preloaders = deploy.settings.assets.preloaders
	// backups
	assetsRunPath.backups = applyRunPath(deploy, deploy.settings.assets.backups)
	// scripts
	assetsRunPath.scripts = applyRunPath(deploy, deploy.settings.assets.scripts)
	// images
	assetsRunPath.images = applyRunPath(deploy, deploy.settings.assets.images)
	// fonts
	assetsRunPath.fonts = applyRunPath(deploy, deploy.settings.assets.fonts)
	// binaries
	assetsRunPath.binaries = applyRunPath(deploy, deploy.settings.assets.binaries)
	return assetsRunPath
}

const applyRunPath = (deploy, assets) => {
	const env = deploy.env
	if (!env || !env.runPath || !env.adPath) {
		return assets
	}
	return assets.map((asset) => {
		return normalizeUrl(`${env.runPath}/${env.adPath}/${asset}`)
	})
}

module.exports = {
	applyIndexSettings,
	applyEnvironment
}
