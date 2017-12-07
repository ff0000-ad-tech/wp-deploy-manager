const modelConformer = require('../model-conformer.js')

const debug = require('debug')
var log = debug('DM:deploy')

var Deploy = new function() {
	var deploy

	this.prepare = function(obj) {
		deploy = modelConformer.conform(obj)
	}

	this.get = function() {
		return deploy
	}
}()

module.exports = Deploy
