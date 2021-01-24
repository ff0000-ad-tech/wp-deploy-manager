const _ = require('lodash')
const path = require('path')

const debug = require('@ff0000-ad-tech/debug')
var log = debug('DM:webpack.config.js')

const PM = require('@ff0000-ad-tech/wp-process-manager')
const DM = require('@ff0000-ad-tech/wp-deploy-manager')
const IndexVariationResolvePlugin = require('@ff0000-ad-tech/wp-resolve-plugin-index-variation')

/**
 *	WEBPACK >>
 * 	For config info, see https://github.com/ff0000-ad-tech/wp-creative-server
 */
const execute = (config) => {
	if (config) {
		config = JSON.parse(config)
	} else {
		config = {}
	}

	/** -- PROCESS MANAGEMENT -----------------------------------------------------------------------------------------------
	 *
	 * 	keep this script in sync with Creative Server
	 *
	 */
	PM.prepare(config.watch)
	PM.startWatching()

	/** -- DEPLOY SETTINGS -----------------------------------------------------------------------------------------------
	 *
	 *	Config is derived from:
	 *		- these base settings
	 *		- config object passed to webpack from Creative-Server
	 *		- Index settings read by Deploy-Manager
	 *
	 */
	DM.config.prepare(
		_.merge(
			{
				// deploy profile
				profile: {
					name: 'default',
					// the ad's environment can be specified by the deploy.
					// by default, it will be determined by the settings loaded from [settings.source.path]
					env: {
						id: 'debug',
						runPath: ''
						// TODO: 	add index/build support for dynamic @common alias
						//				that resolves to [profile.env.common]
					}
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

				// discovered ad settings are added/refreshed here
				// see index.html hooks for more info
				settings: {},

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
	// get settings from [source.context][source.size][source.index]
	DM.adManager.applyIndexSettings(DM.config.get())
	// apply environment id back to [source.context][source.size][source.index]
	DM.adManager.applyEnvironment(DM.config.get())

	log('\nConfig:')
	log(DM.config.get())

	/** -- PAYLOAD SETTINGS -----------------------------------------------------------------------------------------------
	 *
	 *
	 *
	 *
	 */
	// payload plugin watches index for settings & preloader changes
	DM.payload.prepare(
		_.merge(
			{
				// payload settings
				watchPaths: [path.resolve(`${config.scope}/${DM.config.get().source.path}`)],
				entries: [
					{
						name: 'inline',
						type: 'inline',
						assets: {
							get: () => DM.config.get().settings.assets.preloader
						}
					}
				]
			},
			config.payload
		)
	)
	log('\nPayload:')
	log(DM.payload.get())

	/** -- WEBPACK RUNTIME -----------------------------------------------------------------------------------------------
	 *
	 *
	 *
	 */
	return {
		mode: DM.config.get().output.debug ? 'development' : 'production',
		entry: {
			// are injected into index.html, via wp-plugin-index
			initial: path.resolve(config.scope, `${DM.config.get().source.context}/node_modules/@ff0000-ad-tech/ad-entry/index.js`),
			inline: path.resolve(config.scope, `${DM.config.get().source.context}/${DM.config.get().source.size}/.inline-imports.js`),
			// is bundled & polite-loaded into index.html
			build: path.resolve(config.scope, `${DM.config.get().source.context}/${DM.config.get().source.size}/build.js`)
		},
		output: {
			path: path.resolve(config.scope, `${DM.config.get().output.context}/${DM.config.get().output.folder}`),
			filename: '[name].bundle.js'
		},
		resolve: {
			// mainFields: ['module', 'main', 'browser'],
			extensions: ['.js', '.jsx'],
			alias: Object.assign({
				AdData: path.resolve(config.scope, `${DM.config.get().source.context}/common/js/AdData`),
				FtData: path.resolve(config.scope, `${DM.config.get().source.context}/common/js/FtData`),
				GdcData: path.resolve(config.scope, `${DM.config.get().source.context}/common/js/GdcData`),
				'@common': path.resolve(config.scope, `${DM.config.get().source.context}/common`),
				'@size': path.resolve(config.scope, `${DM.config.get().source.context}/${DM.config.get().source.size}`)
			}),
			plugins: [new IndexVariationResolvePlugin(DM.config.get().source.index.replace('.html', ''))]
		},
		module: {
			rules: DM.babel.getBabel({ base64Inline: DM.config.get().profile.base64Inline })
		},
		plugins: DM.plugins.getPlugins({ scope: config.scope, DM, PM, base64Inline: DM.config.get().profile.base64Inline }),
		externals: {
			'ad-global': 'window'
		},
		optimization: DM.optimization.getOptimization(),
		watch: DM.config.get().output.debug,
		devtool: DM.config.get().output.debug ? 'source-map' : false
	}
}

module.exports = {
	execute
}
