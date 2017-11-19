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
	deploy = profile.conform(deploy);
	deploy = refresh(deploy);

	log('Deploy Profile:');
	log(deploy);
	return deploy;
}

// refreshes the settings
function refresh(deploy) {
	log('refresh()');
	// refresh settings
	deploy.settings = settings.refresh(
		deploy
	);
	// refresh deploy paths
	deploy = environments.refresh(
		deploy.settings, 
		deploy
	);
	return deploy;
}




module.exports = { 
	prepare,
	refresh
};