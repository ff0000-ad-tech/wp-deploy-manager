const _ = require('lodash');
const path = require('path');
const traverse = require('traverse');
const escapeStringRegExp = require('escape-string-regexp');


const debug = require('debug');
var log = debug('model-conformer');


// replace all values containing maps to other key's values, format: [deploy.profile.key]
function conform(deploy) {
	deploy = _.extend({}, deploy);
	return traverseKeys(deploy);
}

function traverseKeys(deploy) {
	var didReplace = false;
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
					didReplace = true;
				}
			}
			this.update(newValue);
		}
	});	
	if (didReplace) {
		return traverseKeys(deploy);
	}
	return deploy;
}


module.exports = {
	conform
};
