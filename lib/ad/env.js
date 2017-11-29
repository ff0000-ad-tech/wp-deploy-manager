const _ = require('lodash');
const path = require('path');
const prependHttp = require('prepend-http');
const objectPath = require('object-path');


const debug = require('debug');
var log = debug('DM:ad:env');
// more verbosity
var _log = debug('DM:ad:env:+');
debug.disable('DM:ad:env:+');


// ref - can be overridden
var adEnvironment;
function setAdEnvironment(arg) {
	adEnvironment = arg;
	log('Setting Ad-Environment:');
	log(adEnvironment);
}

function refresh(ad, deploy) {
	const adEnvRef = updateSettings(ad);
	return buildContext(ad, adEnvRef, deploy);
}



function updateSettings(ad) {
	// add selected ad-environment to settings.result
	const adEnvRef = determineAdEnvironment(ad);
	
	// if environment is not defined in settings, add it
	if (!getEnvironment(ad.settings.res.environments, adEnvRef.id)) {
		ad.settings.res.environments.push(adEnvRef);
	}
	// set the ad to use this environment
	ad.settings.res.adParams.environmentId = adEnvRef.id;
	return adEnvRef;
}

function determineAdEnvironment(ad) {
	var adEnvRef = {};
	// if selected
	if (adEnvironment) {
		adEnvRef = adEnvironment;
	}
	// otherwise use ad.settings def
	else {
		adEnvRef = getEnvironment(
			ad.settings.ref.environments,
			ad.settings.ref.adParams.environmentId
		);
	}
	return adEnvRef;
}




// build context for live, debug, and run environments
function buildContext(ad, adEnvRef, deploy) {
	_log('Building context:');
	var context = {
		build: deploy.get().source.context,
		deploy: deploy.get().output.context,
		// ad run-paths determined by selected environment: [deploy.get().source.environment]
		run: {
			live: null,
			debug: null,
			ad: null	
		}
	};

	// generate a debug-path
	var debugRunPath = prependHttp(
		`${ad.paths.debug.domain}${ad.paths.debug.path}`
	);

	// absolutely-pathed deploys, like "http://something..."
	if (adEnvRef.runPath.match(/^http/)) {
		_log(' ABSOLUTELY-PATHED');
		context.deploy = path.normalize(`${context.deploy}/${deploy.get().source.size}`);
		context.run = {
			live: path.normalize(`${adEnvRef.runPath}/${deploy.get().source.size}`),
			debug: path.normalize(`${debugRunPath}/${deploy.get().source.size}`),
			ad: ''
		};
	}

	// relatively-pathed deploys
	else {
		_log(' RELATIVELY-PATHED');

		// SHARED ADLIB: "../"
		if (adEnvRef.runPath == '../') {
			_log('  - shared "_adlib/"');
			context.deploy += '';
			context.run = {
				live: adEnvRef.runPath,
				debug: debugRunPath,
				ad: deploy.get().source.size
			};
		}

		// SELF-CONTAINED: "./" or ""
		else if (adEnvRef.runPath == './' || adEnvRef.runPath == '') {
			_log('  - self-contained');
			context.deploy = path.normalize(`${context.deploy}/${deploy.get().source.size}`);
			context.run = {
				live: adEnvRef.runPath,
				debug: path.normalize(`${debugRunPath}/${deploy.get().source.size}`),
				ad: ''
			};
		}
	}
	_log(context);
	return context;
}






function getEnvironment(environments, environmentId) {
	for (var i in environments) {
		if (environmentId == environments[i].id) {
			return environments[i];
		}
	}
}


module.exports = {
	setAdEnvironment,
	refresh,
	buildContext
};