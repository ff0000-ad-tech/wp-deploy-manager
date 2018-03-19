const Deploy = require('./lib/deploy/deploy.js')
const Ad = require('./lib/ad/ad.js')
const Payload = require('./lib/payload/payload.js')
const Aliases = require('./lib/utils/aliases.js')
const Plugins = require('./lib/plugins')
const Babel = require('./lib/babel')

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

// base Webpack loaders for debug and production settings
var babel = Babel

// base Webpack config plugins
var plugins = Plugins

module.exports = {
	deploy,
	ad,
	payload,
	aliases,
	babel,
	plugins
}
