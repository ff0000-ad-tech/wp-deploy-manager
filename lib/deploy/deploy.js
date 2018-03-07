const modelConformer = require('../utils/model-conformer.js')

const debug = require('debug')
var log = debug('DM:deploy')

var Deploy = new function() {
	var deploy

	this.prepare = function(obj) {
		deploy = modelConformer.conform(obj)
	}

	this.prepareOutputPaths = function() {
		let context = deploy.output.context || './'
		if (!deploy.output.debug) {
			context = `${deploy.output.context}/${deploy.profile.name}`
		}
		let folder = `${deploy.source.size}__${deploy.source.index.split('.')[0]}`
		deploy.output = Object.assign(deploy.output, {
			context,
			folder
		})
	}

	this.get = function() {
		return deploy
	}
}()

module.exports = Deploy
