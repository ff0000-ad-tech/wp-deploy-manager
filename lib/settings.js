const fs = require('fs');
const hooks = require('./hooks.js');

const debug = require('debug');
var log = debug('deploy-manager:settings');
debug.disable('deploy-manager:settings');


// read each hook source
function refresh(deploy) {
	const source = loadSource(deploy);
	if (source) {
		var settings = hooks.readSettings(source);
		log(settings);
		return settings;
	}
}

// load settings source
function loadSource(deploy) {
	const path = `${deploy.context.build}/${deploy.paths.ad.context}/${deploy.ad.index}`;
	log(`Loading settings from ${path}`);
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