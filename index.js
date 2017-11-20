const _ = require('lodash');
const path = require('path');

const profile = require('./lib/profile.js');
const settings = require('./lib/settings.js');
const environments = require('./lib/environments.js');

const debug = require('debug');
var log = debug('deploy-manager');
var logg = debug('deploy-manager:+');


// build the deploy-profile model
function prepare(deploy) {
	// resolve all of the [deploy.model.ref] paths
	deploy = profile.conform(deploy);

	// read the latest state into the deploy model
	deploy = refresh(deploy);

	// resolve environment
	if (!deploy.target.environment) {
		deploy.target.environment = environments.getEnvironment(
			deploy.settings.environments,
			deploy.settings.adParams.environmentId
		);
	}

	log('Deploy Profile:');
	log(deploy);
	return deploy;
}


// refreshes the settings
function refresh(deploy) {
	log('refresh()');
	// refresh settings
	deploy.settings = settings.refresh(deploy);

	// refresh deploy paths
	deploy.env = environments.refresh(deploy);
	return deploy;
}




module.exports = { 
	prepare,
	refresh
};