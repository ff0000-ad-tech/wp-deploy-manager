const path = require('path')
const PayloadPlugin = require('@ff0000-ad-tech/wp-plugin-payload')
const AssetsPlugin = require('@ff0000-ad-tech/wp-plugin-assets')
const IndexPlugin = require('@ff0000-ad-tech/wp-plugin-index')
const WatchOffsetPlugin = require('@ff0000-ad-tech/wp-plugin-watch-offset')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const SuppressChunksPlugin = require('suppress-chunks-webpack-plugin').default
const CopyWebpackPlugin = require('copy-webpack-plugin')
const EventCallbackWebpackPlugin = require('event-callback-webpack-plugin').default

module.exports = function getPlugins({
	DM,
	PM,
	buildEntry,
	fbaTypes
}) {
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
				ignore: ['fonts/**/*', 'js/**/*']
			}
		),

		// user-created files/folders in ad
		new CopyWebpackPlugin(
			[
				{
					context: path.normalize(`${DM.ad.get().env.build}/${DM.ad.get().paths.ad.context}`),
					from: '**/*',
					to: ''
				}
			],
			{
				ignore: ['+(index*|payload*|build*|VERSION*)', 'images/**/*', 'js/**/*', 'platform/**/*']
			}
		),

		// assets declared in the index
		new AssetsPlugin(DM, {
			buildEntry,
			addBinaryAsset: DM.payload.addBinaryAsset,
			fbaTypes,
			output: {
				path: `${DM.deploy.get().output.context}/${DM.deploy.get().output.folder}`,
				filename: 'fba-payload.png'
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
					payload: function() {
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
					payload: function() {
						return DM.payload.store.get('inline')
					}
				},
				{
					id: 'runtime-includes',
					payload: function() {
						return {
							modules: [] //DM.ad.get().settings.ref.runtimeIncludes;
						}
					},
					copy: {
						from: `${DM.ad.get().env.build}`,
						to: `${DM.ad.get().env.deploy}`
					}
				}
			]
		}),

		new IndexPlugin(DM, {
			source: {
				path: `${DM.ad.get().env.build}/${DM.ad.get().paths.ad.context}/${DM.deploy.get().source.index}`
			},
			inject: {
				promise_polyfill: './node_modules/promise-polyfill/dist/polyfill.min.js',
				commons: `${DM.ad.get().env.build}/node_modules/@ff0000-ad-tech/ad-load/dist/umd.min.js`
			},
			output: {
				path: `${DM.deploy.get().output.context}/${DM.deploy.get().output.folder}/index.html`
			}
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
		}),
	] 

	if (!DM.deploy.get().output.debug) {
		const UglifyJsPlugin = require('webpack').optimize.UglifyJsPlugin
		plugins.push(
			new UglifyJsPlugin({
				uglifyOptions: {
					compress: {
						drop_console: true
					}
				},
				sourceMap: false
			})
		)
	}

	return plugins
}