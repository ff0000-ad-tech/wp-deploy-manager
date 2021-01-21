const _ = require('lodash')
const path = require('path')

const debug = require('@ff0000-ad-tech/debug')
var log = debug('DM:webpack.config.js')

const PM = require('@ff0000-ad-tech/wp-process-manager')
const DM = require('@ff0000-ad-tech/wp-deploy-manager')
const IndexVariationResolvePlugin = require('@ff0000-ad-tech/wp-resolve-plugin-index-variation')

const execute = (config, scope) => {
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
	 *	these are unique to each deploy/size/index
	 *
	 *
	 */
	// deploy settings
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

				// discovered ad settings are added/maintained here
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

	// /** -- AD SETTINGS -----------------------------------------------------------------------------------------------
	//  *
	//  *	these settings are unique to framework
	//  *
	//  *
	//  */
	// // ad settings
	// DM.ad.prepare(
	// 	_.merge(
	// 		{

	// 			// ** AD STRUCTURE: common locations
	// 			// paths: {
	// 			// 	// the subpaths for these standard locations can be set
	// 			// 	ad: {
	// 			// 		context: `${DM.config.get().source.size}`,
	// 			// 		js: 'js',
	// 			// 		images: 'images',
	// 			// 		videos: 'videos'
	// 			// 	},
	// 			// 	common: {
	// 			// 		context: 'common',
	// 			// 		js: 'js',
	// 			// 		fonts: 'fonts'
	// 			// 	},
	// 			// 	// `index.html?debug=true` will cause the ad to load from this location
	// 			// 	debug: {
	// 			// 		domain: 'red.ff0000-cdn.net',
	// 			// 		path:
	// 			// 			`/_debug/${DM.config.get().profile.client}/${DM.config.get().profile.project}/` +
	// 			// 			`${DM.config.get().source.size}/${DM.config.get().source.index}`
	// 			// 	}
	// 			// },
	// 			// ad.env is added here
	// 			env: {}
	// 		},
	// 		config.ad
	// 	)
	// )

	// /*** LOAD EXTERNAL SETTINGS **/
	// DM.ad.refresh()
	// log('\nAd:')
	// log(DM.ad.get())

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
				watchPaths: [path.resolve(`${scope}/${DM.config.get().source.path}`)],
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
			initial: path.resolve(scope, `${DM.config.get().source.context}/node_modules/@ff0000-ad-tech/ad-entry/index.js`),
			inline: path.resolve(scope, `${DM.config.get().source.context}/${DM.config.get().source.size}/.inline-imports.js`),
			// is bundled & polite-loaded into index.html
			build: path.resolve(scope, `${DM.config.get().source.context}/${DM.config.get().source.size}/build.js`)
		},
		output: {
			path: path.resolve(scope, `${DM.config.get().output.context}/${DM.config.get().output.folder}`),
			filename: '[name].bundle.js'
		},
		resolve: {
			// mainFields: ['module', 'main', 'browser'],
			extensions: ['.js', '.jsx'],
			alias: Object.assign({
				AdData: path.resolve(scope, `${DM.config.get().source.context}/common/js/AdData`),
				FtData: path.resolve(scope, `${DM.config.get().source.context}/common/js/FtData`),
				GdcData: path.resolve(scope, `${DM.config.get().source.context}/common/js/GdcData`),
				'@common': path.resolve(scope, `${DM.config.get().source.context}/common`),
				'@size': path.resolve(scope, `${DM.config.get().source.context}/${DM.config.get().source.size}`)
			}),
			plugins: [new IndexVariationResolvePlugin(DM.config.get().source.index.replace('.html', ''))]
		},
		module: {
			rules: DM.babel.getBabel({ base64Inline: DM.config.get().profile.base64Inline })
		},
		plugins: DM.plugins.getPlugins({ scope, DM, PM, base64Inline: DM.config.get().profile.base64Inline }),
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
