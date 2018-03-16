const Deploy = require('./lib/deploy/deploy.js')
const Ad = require('./lib/ad/ad.js')
const Payload = require('./lib/payload/payload.js')
const Aliases = require('./lib/utils/aliases.js')
const Config = require('./lib/utils/config.js')

const debug = require('debug')
var log = debug('DM')

// deploy
var deploy = Deploy

// ad
var ad = Ad
ad.init(deploy)

// payload
var payload = Payload

// alias management
var aliases = Aliases

// config utilities
var config = Config

module.exports = {
	deploy,
	ad,
	payload,
	aliases,
	config
}
