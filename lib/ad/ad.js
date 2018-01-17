const _ = require('lodash')

const modelConformer = require('../utils/model-conformer.js')
const objectPath = require('object-path')
const Settings = require('./settings.js')
const Paths = require('./paths.js')
const Env = require('./env.js')

const debug = require('debug')
var log = debug('DM:ad')

var Ad = new function() {
	var deploy
	var ad

	/** -- INIT ----
	 *
	 *
	 */
	this.init = function(_deploy) {
		deploy = _deploy
	}

	// prepare
	this.prepare = function(obj) {
		// conform
		ad = modelConformer.conform(obj)

		// validate
		if (!objectPath.has(ad, 'settings.source.path')) {
			log('ERROR: Path to external settings (ad.settings.source.path) not specified.')
		}
		ad.settings = ad.settings || {}
		ad.paths = ad.paths || {}
		ad.env = ad.env || {}
	}

	// persists override of the ad environment
	this.setAdEnvironment = function(arg) {
		Env.setAdEnvironment(arg)
	}

	/** -- COMMUNICATION ----
	 *
	 *
	 */
	// refresh from settings source
	this.refresh = function() {
		ad.settings.ref = Settings.refresh(ad)
		ad.paths = Paths.refresh(ad)
		ad.env = Env.refresh(ad, deploy)
	}
	// push to settings source
	this.push = function(source) {
		Settings.push(ad, source)
	}

	/** -- DATA ----
	 *
	 *
	 */
	this.get = function() {
		return ad
	}
}()

module.exports = Ad
