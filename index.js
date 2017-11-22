const _ = require('lodash');
const path = require('path');

const profile = require('./lib/profile.js');
const adSettings = require('./lib/ad-settings.js');
const adEnvironments = require('./lib/ad-environments.js');

const debug = require('debug');
var log = debug('deploy-manager');


// build the deploy-profile model
function init(deploy) {
	// resolve all of the [deploy.model.ref] paths
	deploy = profile.conform(deploy);

	// read the latest state into the deploy model
	refresh(deploy);

	log('Deploy Profile:');
	log(deploy);
	return deploy;
}




// generate `deploy.ad` and `deploy.env`
function refresh(deploy) {
	log('refresh()');
	// refresh ad-settings
	deploy.ad = adSettings.refresh(deploy);

	// refresh ad-environments
	deploy.env = adEnvironments.refresh(deploy);
}




module.exports = { 
	init,
	refresh
};