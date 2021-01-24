const modelConformer = require('../utils/model-conformer.js')

const debug = require('@ff0000-ad-tech/debug')
const log = debug('DM:lib:deploy:Config')

const Config = new (function () {
	let config

	this.prepare = (obj) => {
		obj = this.prepareSourceName(obj)
		obj = this.prepareSourcePath(obj)
		obj = this.prepareOutputPaths(obj)
		config = modelConformer.conform(obj)
	}

	this.prepareSourceName = (obj) => {
		if (!obj.source.name) {
			// remove index's extension and "_index_"
			const index = obj.source.index.split('.')[0]
			const name = index.replace(/[\s\-_]*index[\s\-_]*/, '')
			obj.source.name = name
		}
		return obj
	}

	this.prepareSourcePath = (obj) => {
		obj.source.path = `${obj.source.context}/${obj.source.size}/${obj.source.index}`
		return obj
	}

	this.prepareOutputPaths = function (obj) {
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

	this.get = function () {
		return config
	}
})()

module.exports = {
	Config
}
