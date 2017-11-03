const _ = require('lodash');
const path = require('path');
const traverse = require('traverse');
const escapeStringRegExp = require('escape-string-regexp');


const debug = require('debug');
var log = debug('deploy-manager');
var logg = debug('deploy-manager:+');


// replace all values containing maps to other key's values, format: [deploy.profile.key]
function conformDeploy(deploy) {
	deploy = _.extend({}, deploy);
	traverse(deploy).forEach(function(value) {
		if (typeof value == 'string') {
			let newValue = String(value);
			let match;
			let re = /\[([^]+?)\]/g;
			while (match = re.exec(value)) {
				if (match) {
					const keys = match[1].split('.');
					let subValue = deploy;
					keys.forEach((key) => {
						if (key in subValue) {
							subValue = subValue[key];
						}
					});
					let rep = new RegExp(escapeStringRegExp(match[0]));
					newValue = newValue.replace(
						rep, 
						subValue
					);
				}
			}
			this.update(newValue);
		}
	});	
	log('Deploy Profile:');
	log(deploy);
	return deploy;
}





module.exports = { conformDeployProfile };