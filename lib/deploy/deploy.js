const modelConformer = require('../utils/model-conformer.js')

const debug = require('debug')
var log = debug('DM:deploy')

var Deploy = new function() {
	var deploy

	this.prepare = function(obj) {
		obj = this.prepareSourceName(obj)
		obj = this.prepareOutputPaths(obj)
		deploy = modelConformer.conform(obj)
	}

	this.prepareSourceName = function(obj) {
		if (!obj.source.name) {
			// remove index's extension and "_index_"
			const index = obj.source.index.split('.')[0]
			const name = index.replace(/[\s\-_]*index[\s\-_]*/, '')
			obj.source.name = name
		}
		return obj
	}

	this.prepareOutputPaths = function(obj) {
		let context = obj.output.context || './'
		if (!obj.output.debug) {
			context = `${obj.output.context}/${obj.profile.name}`
		}
		let name = obj.source.name
		if (!name || obj.source.name === '') {
			name = ''
		} else {
			name = `__${obj.source.name}`
		}
		let folder = obj.output.folder || `${obj.source.size}${name}`
		obj.output = Object.assign(obj.output, {
			context,
			folder
		})
		return obj
	}

	this.get = function() {
		return deploy
	}
}()

module.exports = Deploy
