const config = require('./lib/config/manager.js')
const adManager = require('./lib/ad/manager.js')

const Payload = require('./lib/payload/payload.js')
const Aliases = require('./lib/utils/aliases.js')
const Plugins = require('./lib/plugins')
const Optimization = require('./lib/optimization')
const Babel = require('./lib/babel')

const debug = require('@ff0000-ad-tech/debug')
var log = debug('DM')

// payload
var payload = Payload

// alias management
var aliases = Aliases

// base Webpack loaders for debug and production settings
var babel = Babel

// base Webpack config plugins
var plugins = Plugins

// base Webpack optimization
var optimization = Optimization

module.exports = {
	config: config.Config,
	adManager,
	payload,
	aliases,
	babel,
	plugins,
	optimization
}
