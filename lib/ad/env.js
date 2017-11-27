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
	var env = {};
	env.ref = buildRef(ad);
	env.context = buildContext(ad, env, deploy);
	return env;
}



// build an env ref based on selected ad-environment
function buildRef(ad) {
	var ref = {};
	// use ad.settings def, if not set specifically
	if (adEnvironment) {
		ref = adEnvironment;
	}
	else {
		ref = getEnvironment(
			ad.settings.environments,
			ad.settings.adParams.environmentId
		);
	}
	return ref;
}



// build context for live, debug, and run environments
function buildContext(ad, env, deploy) {
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
	if (env.ref.runPath.match(/^http/)) {
		_log(' ABSOLUTELY-PATHED');
		context.deploy = path.normalize(`${context.deploy}/${deploy.get().source.size}`);
		context.run = {
			live: path.normalize(`${env.ref.runPath}/${deploy.get().source.size}`),
			debug: path.normalize(`${debugRunPath}/${deploy.get().source.size}`),
			ad: ''
		};
	}

	// relatively-pathed deploys
	else {
		_log(' RELATIVELY-PATHED');

		// SHARED ADLIB: "../"
		if (env.ref.runPath == '../') {
			_log('  - shared "_adlib/"');
			context.deploy += '';
			context.run = {
				live: env.ref.runPath,
				debug: debugRunPath,
				ad: deploy.get().source.size
			};
		}

		// SELF-CONTAINED: "./" or ""
		else if (env.ref.runPath == './' || env.ref.runPath == '') {
			_log('  - self-contained');
			context.deploy = path.normalize(`${context.deploy}/${deploy.get().source.size}`);
			context.run = {
				live: env.ref.runPath,
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