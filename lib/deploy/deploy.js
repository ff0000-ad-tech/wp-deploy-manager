const modelConformer = require('../utils/model-conformer.js')

const debug = require('debug')
var log = debug('DM:deploy')

var Deploy = new function() {
	var deploy

	this.prepare = function(obj) {
		deploy = modelConformer.conform(obj)
	}

	this.prepareSourceName = function() {
		if (!deploy.source.name) {
			// remove index's extension and "_index_"
			deploy.source.name = deploy.source.index.split('.')[0].replace(/[\s\-_]*index[\s\-_]*/)
		}
	}

	this.prepareOutputPaths = function() {
		let context = deploy.output.context || './'
		if (!deploy.output.debug) {
			context = `${deploy.output.context}/${deploy.profile.name}`
		}
		let folder = deploy.output.folder || `${deploy.source.size}__${deploy.source.name}`
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
