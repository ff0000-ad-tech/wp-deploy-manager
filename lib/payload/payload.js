const modelConformer = require('../model-conformer.js');
const Store = require('./store.js');

const debug = require('debug');
var log = debug('DM:payload');

module.exports = new function() {
	var payload;

	this.prepare = function(obj) {
		payload = modelConformer.conform(obj);
	}

	this.get = function() {
		return payload;
	}

	this.store = Store;
}