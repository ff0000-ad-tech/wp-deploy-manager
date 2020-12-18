const path = require('path')
const PayloadPlugin = require('@ff0000-ad-tech/wp-plugin-payload')
const AssetsPlugin = require('@ff0000-ad-tech/wp-plugin-assets')
const IndexPlugin = require('@ff0000-ad-tech/wp-plugin-index')
const WatchOffsetPlugin = require('@ff0000-ad-tech/wp-plugin-watch-offset')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const SuppressChunksPlugin = require('suppress-chunks-webpack-plugin').default
const CopyWebpackPlugin = require('copy-webpack-plugin')
const EventCallbackWebpackPlugin = require('event-callback-webpack-plugin').default

const debug = require('@ff0000-ad-tech/debug')
var log = debug('DM:plugins')

module.exports = function getPlugins({ DM, PM, base64Inline }) {
	const plugins = [
		// prevents generated files from triggering watch cycle
		new WatchOffsetPlugin(),

		// control output
		new CleanWebpackPlugin(`${DM.deploy.get().output.context}/${DM.deploy.get().output.folder}/**/*`),

		// write imports for assets into specified entries, make output available for wp-plugin-assets
		new PayloadPlugin(DM, DM.payload.get()),

		// user-created folders in common
		new CopyWebpackPlugin(
			[
				{
					context: path.normalize(`${DM.ad.get().env.build}/${DM.ad.get().paths.common.context}`),
					from: '**/*',
					to: `${DM.ad.get().paths.common.context}`
				}
			],
			{
				ignore: ['js/**/*', 'components/**/*', 'fonts/**/*', 'images/**/*']
			}
		),

		// user-created files/folders in build-size
		new CopyWebpackPlugin(
			[
				{
					context: path.normalize(`${DM.ad.get().env.build}/${DM.ad.get().paths.ad.context}`),
					from: '**/*',
					to: ''
				}
			],
			{
				ignore: [
					'+(index*|payload*|build*|VERSION*)',
					'*(backup*+(jpg|png|gif))',
					'images/**/*',
					'js/**/*',
					'components/**/*',
					'platform/**/*'
				]
			}
		),

		// binary assets
		new AssetsPlugin(DM, {
			fba: {
				entry: 'build',
				base64Inline,
				output: {
					context: `${DM.deploy.get().output.context}/${DM.deploy.get().output.folder}`,
					filename: 'fba-payload.png'
				},
				setPayloadReq: filename => {
					DM.ad.get().settings.ref.assets.payload.binary = filename ? [filename] : []
				}
			},
			assets: [
				{
					id: 'fba-images',
					payload: () => DM.payload.store.get('fba-images')
				},
				{
					id: 'fba-fonts',
					payload: () => DM.payload.store.get('fba-fonts')
				},
				{
					id: 'backups',
					payload: function () {
						return {
							modules: DM.ad.get().settings.ref.assets.failover.images.map(obj => {
								return obj.source
							})
						}
					},
					copy: {
						from: `${DM.ad.get().env.build}/${DM.ad.get().paths.ad.context}`,
						to: `${DM.deploy.get().output.context}/${DM.deploy.get().output.folder}`
					}
				},
				{
					id: 'preloaders',
					payload: function () {
						return DM.payload.store.get('inline')
					}
				}
			]
		}),

		new IndexPlugin({
			source: {
				path: `${DM.ad.get().env.build}/${DM.ad.get().paths.ad.context}/${DM.deploy.get().source.index}`
			},
			// inject: {
			// 	'ad-global': `${DM.ad.get().env.build}/node_modules/@ff0000-ad-tech/ad-global/dist/ad-global.inline.js`,
			// 	promise_polyfill: './node_modules/promise-polyfill/dist/polyfill.min.js'
			// },
			output: {
				path: `${DM.deploy.get().output.context}/${DM.deploy.get().output.folder}/index.html`,
				minify: !this.DM.deploy.get().output.debug
			},
			injections: [
				{
					hook: 'Red.Settings.ad_params',
					value: `var adParams = ${JSON.stringify(DM.ad.get().settings.ref.adParams, null, '\t')};`
				},
				{
					hook: 'Red.Settings.assets',
					value: `var assets = ${JSON.stringify(DM.ad.get().settings.ref.assets, null, '\t')};`
				},
				{
					hook: 'Red.Settings.environments',
					value: `var environments = ${JSON.stringify(DM.ad.get().settings.ref.environments, null, '\t')};`
				},
				{
					hook: 'Red.Bundle.inline',
					bundle: 'inline.bundle.js'
				},
				{
					hook: 'Red.Bundle.initial',
					bundle: 'initial.bundle.js'
				},
				{ hook: 'Red.Require.*', file: /require\(([^\)]+)\)/ }
			]
		}),

		new SuppressChunksPlugin(['initial', 'inline', 'image', 'font']),

		new EventCallbackWebpackPlugin('compile', () => {
			PM.setError(false)
			PM.setProcessing(true)
		}),
		new EventCallbackWebpackPlugin('done', stats => {
			if (stats.compilation.errors && stats.compilation.errors.length) {
				PM.setError(true)
			}
			PM.setProcessing(false)
			if (!DM.deploy.get().output.debug) {
				PM.completeWatch()
			}
		})
	]

	return plugins
}
