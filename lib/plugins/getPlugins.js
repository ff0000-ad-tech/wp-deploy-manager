const path = require('path')
const WatchOffsetPlugin = require('@ff0000-ad-tech/wp-plugin-watch-offset')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const IndexPlugin = require('@ff0000-ad-tech/wp-plugin-index')
const AssetsPlugin = require('@ff0000-ad-tech/wp-plugin-assets')
const SuppressChunksPlugin = require('suppress-chunks-webpack-plugin').default
const EventHooksPlugin = require('event-hooks-webpack-plugin')

const assetsConfigDefault = require('./assets-config-default.js')
const assetsConfigFba = require('./assets-config-fba.js')

const debug = require('@ff0000-ad-tech/debug')
var log = debug('DM:plugins')

const COPY_IGNORE_FOLDERS = ['js/**/*', 'components/**/*', 'styles/**/*', 'fonts/**/*', 'images/**/*', 'dps*/**/*']

module.exports = function getPlugins({ scope, DM, PM, fbaCompile }) {
	const sourceContext = path.resolve(scope, DM.deploy.get().source.context)
	const outputContext = path.resolve(scope, DM.deploy.get().output.context)

	const plugins = [
		// prevents generated files from triggering watch cycle
		new WatchOffsetPlugin(),

		// control output
		new CleanWebpackPlugin({
			dry: false,
			dangerouslyAllowCleanPatternsOutsideProject: true
		}),

		// write imports for assets into specified entries, make output available for wp-plugin-assets
		// new PayloadPlugin(scope, DM, DM.payload.get()),

		// user-created folders in common
		new CopyWebpackPlugin(
			[
				{
					context: path.resolve(sourceContext, DM.deploy.get().source.common),
					from: '**/*',
					to: ``
				}
			],
			{
				ignore: COPY_IGNORE_FOLDERS
			}
		),

		// user-created files/folders in build-size
		new CopyWebpackPlugin(
			[
				{
					context: path.resolve(sourceContext, DM.deploy.get().source.size),
					from: '**/*',
					to: ''
				}
			],
			{
				ignore: ['+(index*|payload*|build*)', '*(backup*+(jpg|png|gif))', ...COPY_IGNORE_FOLDERS]
			}
		),

		// index transformations
		new IndexPlugin(DM, scope, {
			source: {
				path: path.resolve(sourceContext, `${DM.deploy.get().source.size}/${DM.deploy.get().source.index}`)
			},
			output: {
				path: path.resolve(outputContext, `${DM.deploy.get().output.folder}/index.html`),
				minify: !DM.deploy.get().output.debug
			},
			injections: [
				{
					hook: 'Red.Settings.ad_params',
					value: () => `var adParams = ${JSON.stringify(DM.deploy.get().settings.adParams, null, '\t')};`
				},
				{
					hook: 'Red.Settings.assets',
					value: () => {
						const assetsRunPath = DM.adManager.applyEnvironment(DM.deploy.get())
						return `var assets = ${JSON.stringify(assetsRunPath, null, '\t')};`
					}
				},
				{
					hook: 'Red.Bundle.inline',
					bundle: 'inline.bundle.js'
				},
				{
					hook: 'Red.Bundle.initial',
					bundle: 'initial.bundle.js'
				},
				{
					hook: 'Red.Require.*',
					file: /require\(['"`]([^\)]+)['"`]\)/
				}
			],
			inlineAssets: {
				entry: 'inline',
				sources: () => DM.deploy.get().settings.assets.preloaders
			}
		}),

		// assets
		new AssetsPlugin(
			DM,
			fbaCompile ? assetsConfigFba.get(DM, sourceContext, outputContext) : assetsConfigDefault.get(DM, sourceContext, outputContext)
		),

		new SuppressChunksPlugin(['initial', 'inline', 'image', 'font']),

		// webpack event hooks communication to Creative Server
		new EventHooksPlugin({
			compile: (compilationParams) => {
				PM.setError(false)
				PM.setProcessing(true)
			}
		}),
		new EventHooksPlugin({
			done: (stats) => {
				if (stats.compilation.errors && stats.compilation.errors.length) {
					PM.setError(true)
				}
				PM.setProcessing(false)
				if (!DM.deploy.get().output.debug) {
					PM.completeWatch()
				}
			}
		})
	]

	return plugins
}
