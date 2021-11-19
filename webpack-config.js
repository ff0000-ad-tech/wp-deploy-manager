const _ = require('lodash')
const path = require('path')

const DM = require('./index.js')
const PM = require('@ff0000-ad-tech/wp-process-manager')
const IndexVariationResolvePlugin = require('@ff0000-ad-tech/wp-resolve-plugin-index-variation')

const debug = require('@ff0000-ad-tech/debug')
var log = debug('DM:webpack.config.js')

/**
 *	WEBPACK >>
 * 	For config info, see https://github.com/ff0000-ad-tech/wp-creative-server
 */
/**
 * NOTE!! This is NOT webpack.config.js!
 *
 * This module intended to be required into a real webpack.config.js
 */
const execute = async (env) => {
	if (env.settings) {
		config = JSON.parse(env.settings)
	} else {
		config = {}
	}

	/** -- PROCESS MANAGEMENT ----
	 *
	 * 	keep this script in sync with Creative Server
	 *
	 */
	PM.prepare(config.watch)
	PM.startWatching()

	/** -- COMPILATION SCOPE ----
	 *
	 *
	 */
	log(``)
	log(`Compilation Scope:`)
	log(config.scope)

	/** -- DEPLOY SETTINGS ----
	 *
	 *	Config is derived from:
	 *		- these base settings
	 *		- config object passed to webpack from Creative-Server
	 *		- Index settings read by Deploy-Manager
	 *
	 */
	DM.deploy.prepare(
		_.merge(
			{
				// deploy profile
				profile: {
					name: 'default'
				},

				// the context from which the ad will subload its assets
				// NOTE: deploy.config.env is passed from Creative Server by default
				env: {
					runPath: '',
					adPath: ''
				},

				// source
				source: {
					context: './1-build',
					common: 'common',
					size: '300x250',
					index: 'index.html'
					// path: // derived from [source.context][source.size][source.index]
					// name: 'index' // if not specified, this will be derived from [source.index]
				},

				// output
				output: {
					debug: true,
					context: './2-debug'
					// folder: '' // if not specified, this will be derived from [source.size]__[source.name]
				}
			},
			config.deploy
		)
	)

	// discovered ad settings are added here
	// see index.html hooks for more info
	// NOTE: config.deploy.settings can override what's in the index
	DM.deploy.get().settings = await DM.adManager.applyIndexSettings(config.scope, DM.deploy.get())

	log(``)
	log('DM.deploy Config:')
	log(DM.deploy.get())

	/** -- CONTEXT ----
	 *
	 *
	 *
	 */
	const sourceContext = path.resolve(config.scope, DM.deploy.get().source.context)
	const outputContext = path.resolve(config.scope, DM.deploy.get().output.context)

	/** -- WEBPACK RUNTIME ----
	 *
	 *
	 *
	 */
	return {
		mode: DM.deploy.get().output.debug ? 'development' : 'production',
		entry: {
			// are injected into index.html, via wp-plugin-index
			initial: `${sourceContext}/node_modules/@ff0000-ad-tech/ad-entry/index.js`,
			inline: `${sourceContext}/${DM.deploy.get().source.size}/.inline-imports.js`,
			// is bundled & polite-loaded into index.html
			build: `${sourceContext}/${DM.deploy.get().source.size}/build.js`
		},
		target: 'web',
		output: {
			path: `${outputContext}/${DM.deploy.get().output.folder}`,
			filename: '[name].bundle.js'
		},
		resolve: {
			// mainFields: ['module', 'main', 'browser'],
			extensions: ['.js', '.jsx'],
			alias: Object.assign({
				'@common': `${sourceContext}/common`,
				'@size': `${sourceContext}/${DM.deploy.get().source.size}`
			}),
			plugins: [new IndexVariationResolvePlugin(DM.deploy.get().source.index.replace('.html', ''))],
			modules: ['node_modules', path.resolve(__dirname, 'node_modules')]
		},
		module: {
			rules: DM.babel.getBabel({
				root: __dirname
			})
		},
		plugins: DM.plugins.getPlugins({
			scope: config.scope,
			DM,
			PM,
			fbaCompile: DM.deploy.get().profile.fbaCompile
		}),
		externals: {
			'ad-global': 'window'
		},
		optimization: DM.optimization.getOptimization({ optimize: DM.deploy.get().profile.optimize }),
		watch: DM.deploy.get().output.debug,
		devtool: DM.deploy.get().output.debug ? 'source-map' : false
	}
}

module.exports = {
	execute
}
