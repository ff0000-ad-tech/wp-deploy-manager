const _ = require('lodash');
const path = require('path');
const prependHttp = require('prepend-http');

const debug = require('debug');
var log = debug('deploy-manager:environments');
debug.disable('deploy-manager:environments');


function getEnvironment(environments, environmentId) {
	for (var i in environments) {
		if (environmentId == environments[i].id) {
			return environments[i];
		}
	}
}



// Deploy Paths - where assets are on the filesystem
// Ad Paths - where the ad looks for assets
function refresh(deploy) {
	log('Setting Deploy Paths:');

	// model
	var env = _.extend({}, deploy.env);

	// generate a debug-path
	var debugRunPath = prependHttp(
		`${deploy.env.paths.debug.domain}${deploy.env.paths.debug.path}`
	);

	// absolutely-pathed deploys, like "http://something..."
	if (deploy.target.environment.runPath.match(/^http/)) {
		log(' ABSOLUTELY-PATHED');
		env.context.deploy = path.normalize(`${deploy.env.context.deploy}/${deploy.env.target.size}`);
		env.paths.run = {
			live: path.normalize(`${deploy.target.environment.runPath}/${deploy.target.size}`),
			debug: path.normalize(`${debugRunPath}/${deploy.target.size}`),
			ad: ''
		};
	}

	// relatively-pathed deploys
	else {
		log(' RELATIVELY-PATHED');

		// SHARED ADLIB: "../"
		if (deploy.target.environment.runPath == '../') {
			log('  - shared "_adlib/"');
			env.context.deploy += '';
			env.paths.run = {
				live: deploy.target.environment.runPath,
				debug: debugRunPath,
				ad: deploy.target.size
			};
		}

		// SELF-CONTAINED: "./" or ""
		else if (deploy.target.environment.runPath == './' || deploy.target.environment.runPath == '') {
			log('  - self-contained');
			env.context.deploy = path.normalize(`${deploy.env.context.deploy}/${deploy.target.size}`);
			env.paths.run = {
				live: deploy.target.environment.runPath,
				debug: path.normalize(`${debugRunPath}/${deploy.target.size}`),
				ad: ''
			};
		}
	}
	log(env.paths);
	return env;
}





module.exports = {
	getEnvironment,
	refresh
};