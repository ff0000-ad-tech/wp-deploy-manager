const fs = require('fs')

const modelConformer = require('../utils/model-conformer.js')
const Store = require('./store.js')

const debug = require('@ff0000-ad-tech/debug')
var log = debug('DM:payload')

var Payload = new (function () {
	var payload

	this.prepare = function (obj) {
		payload = modelConformer.conform(obj)
	}

	// store binary asset found by Rollup here for Asset Plugin / FBA Compiler's use
	/* tracking payloads has several layers of complexity:
	 * each compile:
	 *  	the previous compile's payloads/modules are stashed for reference
	 * 		the store of payloads/modules is reset
	 * 		webpack-rollup-babel-loader adds all of the module imports it finds
	 * 		timestamps are recorded for each module
	 * 		logic is applied to determine whether the module is "dirty", ie requiring the fba-payload to be recompiled
	 */
	this.watchAsset = (entry, type, asset) => {
		this.store.add({
			entry,
			type,
			modules: {
				[asset.path]: fs.statSync(asset.path).mtimeMs
			}
		})
	}

	this.get = function () {
		return payload
	}

	this.store = Store
})()

module.exports = Payload
