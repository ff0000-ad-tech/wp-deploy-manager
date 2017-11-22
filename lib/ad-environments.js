const _ = require('lodash');
const path = require('path');
const prependHttp = require('prepend-http');
const objectPath = require('object-path');


const debug = require('debug');
var log = debug('deploy-manager:ad-environments');
debug.disable('deploy-manager:ad-environments');


// build an env based on selected ad-environment
function refresh(deploy) {
	var env = {}

	// ref - can be overridden by [target.adEnvironment]
	log('Selecting Ad-Environment');
	if (objectPath.has(deploy, 'source.adEnvironment')) {
		log(' - using deploy definition: (deploy.source.adEnvironment)');
		env.ref = deploy.source.adEnvironment;
	}
	// otherwise honors the adEnv specified by the settings-source 
	else {
		log(' - using ad definition');
		env.ref = adEnvironments.getEnvironment(
			deploy.ad.environments,
			deploy.ad.adParams.environmentId
		);
	}

	// paths to standard locations
	env.paths = _.extend({
		ad: {
			context: '[source.size]',
			js: 'js',
			images: 'images',
			videos: 'videos'
		},
		core: {
			context: '_adlib/core',
			js: 'js'
		},
		common: {
			context: '_adlib/common',
			js: 'js',
			fonts: 'fonts'
		},
		// `index.html?debug=true` will cause the ad to load from this location
		debug: {
			domain: 'red.ff0000-cdn.net',
			path: '/_debug/[profile.client]/[profile.project]/[profile.name]'
		}					
	}, deploy.settings.paths);


	// fs contexts for build, deploy, and run
	env.context = buildRunPaths(deploy, env);

	return env;
}




function buildRunPaths(deploy, env) {
	var context = {
		build: deploy.source.context,
		deploy: deploy.output.context,
		// ad run-paths determined by selected environment: [deploy.source.environment]
		run: {
			live: null,
			debug: null,
			ad: null	
		}
	};

	// generate a debug-path
	var debugRunPath = prependHttp(
		`${env.paths.debug.domain}${env.paths.debug.path}`
	);

	// absolutely-pathed deploys, like "http://something..."
	if (env.ref.runPath.match(/^http/)) {
		log(' ABSOLUTELY-PATHED');
		context.deploy = path.normalize(`${context.deploy}/${deploy.source.size}`);
		context.run = {
			live: path.normalize(`${env.ref.runPath}/${deploy.source.size}`),
			debug: path.normalize(`${debugRunPath}/${deploy.source.size}`),
			ad: ''
		};
	}

	// relatively-pathed deploys
	else {
		log(' RELATIVELY-PATHED');

		// SHARED ADLIB: "../"
		if (env.ref.runPath == '../') {
			log('  - shared "_adlib/"');
			context.deploy += '';
			context.run = {
				live: env.ref.runPath,
				debug: debugRunPath,
				ad: deploy.source.size
			};
		}

		// SELF-CONTAINED: "./" or ""
		else if (env.ref.runPath == './' || env.ref.runPath == '') {
			log('  - self-contained');
			context.deploy = path.normalize(`${context.deploy}/${deploy.source.size}`);
			context.run = {
				live: env.ref.runPath,
				debug: path.normalize(`${debugRunPath}/${deploy.source.size}`),
				ad: ''
			};
		}
	}
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
	refresh
};