const hooksRegex = require('hooks-regex');
const requireFromString = require('require-from-string');

const debug = require('debug');
var log = debug('deploy-manager:hooks');


// define expected model with the hook-ids
var hooks = {
	adParams: 'ad_params',
	assets: 'assets',
	environments: 'environments',
	includes: 'includes',
	externalIncludes: 'external_includes',
	runtimeIncludes: 'runtime_includes'
};

function readSettings(source, deploy) {
	var settings = {};
	for (var key in hooks) {
		var matches = source.match(
			hooksRegex.get('Red', 'Settings', hooks[key])
		);
		if (matches) {
			// :( runtime-includes require special parsing
			if (key == 'runtimeIncludes') {
				settings[key] = parseRuntimeIncludes(matches, deploy);
			}

			// all other hooks can be parsed with a little node-require trickery
			else {
				settings[key] = requireFromString(
					`${matches.groups.content} module.exports = ${key};`
				);
			}
		}
	}
	return settings;
}


function parseRuntimeIncludes(matches, deploy) {
	var runtimeIncludes = [];
	const reqs = matches.groups.content.replace(/^[^\{]+\{/, '').replace(/\}[^\}]*/, '').split(',');
	reqs.forEach((req) => {
		// context
		const contextVarMatch = matches.groups.content.match(/return\s+(\S+)/);
		if (contextVarMatch) {
			// request
			const subpath = matches.groups.content.match(/['"]([^'"]*)['"]/)[1];
			var path;
			switch (contextVarMatch[1]) {
				case 'adParams.adPath':
					path = `${deploy.env.paths.ad.context}/${subpath}`;
					break;
				case 'adParams.corePath':
					path = `${deploy.env.paths.core.context}/${subpath}`;
					break;
				case 'adParams.commonPath':
					path = `${deploy.env.paths.common.context}/${subpath}`;
					break;
				case 'adParams.jsPath':
					path = `${deploy.env.paths.common.context}/${deploy.env.paths.common.js}/${subpath}`;
					break;
			}
			runtimeIncludes.push(path);
		}
	});
	return runtimeIncludes;
}


module.exports = {
	readSettings
};