const _ = require('lodash')
const path = require('path')
const prependHttp = require('prepend-http')
const objectPath = require('object-path')

const debug = require('debug')
var log = debug('DM:ad:env')
// more verbosity
var _log = debug('DM:ad:env:+')
debug.disable('DM:ad:env:+')

// ref - can be overridden
var adEnvironment
function setAdEnvironment(arg) {
	adEnvironment = arg
	log('Setting Ad-Environment:')
	log(adEnvironment)
}

function refresh(ad, deploy) {
	const adEnvRef = updateSettings(ad)
	return buildContext(ad, adEnvRef, deploy)
}

function updateSettings(ad) {
	// add selected ad-environment to settings.ref
	const adEnvRef = determineAdEnvironment(ad)
	let hasEnv = false
	for (var i in ad.settings.ref.environments) {
		if (ad.settings.ref.environments[i].id === adEnvRef.id) {
			hasEnv = true
			ad.settings.ref.environments[i] = adEnvRef
			break
		}
	}
	if (!hasEnv) {
		ad.settings.ref.environments.push(adEnvRef)
	}
	// set the ad to use this environment
	ad.settings.ref.adParams.environmentId = adEnvRef.id
	return adEnvRef
}

function determineAdEnvironment(ad, debug) {
	var adEnvRef = {}
	if (debug) {
		// if debug mode
		adEnvRef = getEnvironment(ad.settings.ref.environments, 'debug')
	} else if (adEnvironment) {
		// if selected
		adEnvRef = adEnvironment
	} else {
		// otherwise use ad.settings def
		adEnvRef = getEnvironment(ad.settings.ref.environments, ad.settings.ref.adParams.environmentId)
	}
	return adEnvRef
}

// build context for live, debug, and run environments
function buildContext(ad, adEnvRef, deploy) {
	_log('Building context:')
	var context = {
		build: deploy.get().source.context,
		deploy: deploy.get().output.context,
		// ad run-paths determined by selected environment: [deploy.get().source.environment]
		run: {
			live: null,
			debug: null,
			ad: null
		}
	}

	// generate a debug-path
	var debugRunPath = prependHttp(`${ad.paths.debug.domain}${ad.paths.debug.path}`)

	// absolutely-pathed deploys, like "http://something..."
	if (adEnvRef.runPath.match(/^http/)) {
		_log(' ABSOLUTELY-PATHED')
		context.deploy = path.normalize(`${context.deploy}`)
		context.run = {
			live: path.normalize(`${adEnvRef.runPath}`),
			debug: path.normalize(`${debugRunPath}`),
			ad: ''
		}
	} else {
		// relatively-pathed deploys
		_log(' RELATIVELY-PATHED')

		// SHARED ADLIB: "../"
		if (adEnvRef.runPath == '../') {
			_log('  - shared "_adlib/"')
			context.deploy = path.normalize(`${context.deploy}`)
			context.run = {
				live: adEnvRef.runPath,
				debug: debugRunPath,
				ad: adEnvRef.adPath
			}
		} else if (adEnvRef.runPath == './' || adEnvRef.runPath == '') {
			// SELF-CONTAINED: "./" or ""
			_log('  - self-contained')
			context.deploy = path.normalize(`${context.deploy}`)
			context.run = {
				live: adEnvRef.runPath,
				debug: path.normalize(`${debugRunPath}`),
				ad: ''
			}
		}
	}
	_log(context)
	return context
}

function getEnvironment(environments, environmentId) {
	for (var i in environments) {
		if (environmentId == environments[i].id) {
			return environments[i]
		}
	}
}

module.exports = {
	setAdEnvironment,
	refresh,
	buildContext
}
