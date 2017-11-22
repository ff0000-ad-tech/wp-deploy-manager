const _ = require('lodash');
const fs = require('fs');
const objectPath = require('object-path');

const hooks = require('./hooks.js');

const debug = require('debug');
var log = debug('deploy-manager:ad-settings');


// read each hook source
function refresh(deploy) {
	var ad = _.extend({
		/* TODO: Write a default model here */
	}, deploy.ad || {});

	// validate
	if (!objectPath.has(deploy, 'settings.source.path')) {
		log('ERROR: Path to external settings (options.settings.source.path) not specified.');
	}
	// load external 
	const data = loadExternalSettings(
		deploy.settings.source.path
	);
	if (data) {
		switch (deploy.settings.source.type) {
			case 'hooks':
				ad = _.merge(
					ad,
					hooks.readSettings(data, deploy)
				);
				break;
			case 'json':
			default:
				ad = _.merge(
					ad,
					JSON.parse(data)
				);
				break;
		}
		return ad;
	}
}

// load settings source
function loadExternalSettings(path) {
	try {
		return fs.readFileSync(path, 'utf8');
	}
	catch (err) {
		log(err);
	}
}





module.exports = {
	refresh
};