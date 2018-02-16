const modelConformer = require('../utils/model-conformer.js')
const Store = require('./store.js')

const debug = require('debug')
var log = debug('DM:payload')

var Payload = new function() {
	var payload
	var binaryAssetsStore = {}

	this.prepare = function(obj) {
		payload = modelConformer.conform(obj)
	}

	// store binary asset found by Rollup here
	// for Asset Plugin / FBA Compiler's use
	this.addBinaryAsset = (asset) => {
		binaryAssetsStore[asset.path] = asset
	}

	this.getBinaryAssets = () => {
		var keys = Object.keys(binaryAssetsStore)
		return keys.map(key => binaryAssetsStore[key])
	}

	this.get = function() {
		return payload
	}

	this.store = Store
}()

module.exports = Payload
