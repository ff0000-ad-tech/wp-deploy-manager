const _ = require('lodash');
const fs = require('fs');
const hooks = require('./hooks.js');

const debug = require('debug');
var log = debug('deploy-manager:settings');


// read each hook source
function refresh(deploy) {
	var settings = _.extend({}, deploy.settings);

	const data = loadSource(
		deploy.settings.source.context
	);
	if (data) {
		switch (deploy.settings.source.type) {
			case 'hooks':
				settings = _.merge(
					settings,
					hooks.readSettings(data, deploy)
				);
				break;
			case 'json':
			default:
				settings = _.merge(
					settings,
					JSON.parse(data)
				);
				break;
		}
		return settings;
	}
}

// load settings source
function loadSource(path) {
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