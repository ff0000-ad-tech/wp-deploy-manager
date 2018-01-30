const Deploy = require('./lib/deploy/deploy.js')
const Ad = require('./lib/ad/ad.js')
const Payload = require('./lib/payload/payload.js')
const Aliases = require('./lib/utils/aliases.js')

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

module.exports = {
	deploy,
	ad,
	payload,
	aliases,
}
