const settings = require('./settings.js')

const debug = require('@ff0000-ad-tech/debug')
var log = debug('DM:ad')

const applyIndexSettings = (scope, deploy) => {
	const indexSettings = settings.loadSettings(scope, deploy)
	deploy.settings = Object.assign({}, deploy.settings, indexSettings)
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
	const env = deploy.profile.env
	if (!env || !env.runPath || !env.adPath) {
		return assets
	}
	return assets.map((asset) => {
		return concatAndResolveUrl(concatAndResolveUrl(env.runPath, env.adPath), asset)
	})
}

// NOTE: temp hack, use a proper npm package for this
const concatAndResolveUrl = (url, concat) => {
	var url1 = url.split('/')
	var url2 = concat.split('/')
	var url3 = []
	for (var i = 0, l = url1.length; i < l; i++) {
		if (url1[i] == '..') {
			url3.pop()
		} else if (url1[i] == '.') {
			continue
		} else {
			url3.push(url1[i])
		}
	}
	for (var i = 0, l = url2.length; i < l; i++) {
		if (url2[i] == '..') {
			url3.pop()
		} else if (url2[i] == '.') {
			continue
		} else {
			url3.push(url2[i])
		}
	}
	return url3.join('/')
}

module.exports = {
	applyIndexSettings,
	applyEnvironment
}
