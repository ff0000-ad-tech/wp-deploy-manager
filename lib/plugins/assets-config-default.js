const path = require('path')

const debug = require('@ff0000-ad-tech/debug')
const log = debug('DM:plugins:assets-config-default')

const get = (DM, sourceContext, outputContext) => {
	return {
		aggregators: [
			{
				entry: 'build',
				filter: {
					type: 'images',
					include: /\.(png|jpg|gif|svg)(\?.*)?$/
				},
				store: (type, assetPath) => {
					DM.payload.watchAsset(type, assetPath)
				},
				setter: (assets) => {
					DM.deploy.get().settings.assets.images = assets || []
				}
			},
			{
				entry: 'build',
				filter: {
					type: 'fonts',
					include: /\.(ttf|woff)(\?.*)?$/
				},
				store: (type, assetPath) => {
					DM.payload.watchAsset(type, assetPath)
				},
				setter: (assets) => {
					DM.deploy.get().settings.assets.fonts = assets || []
				}
			}
		],
		emitters: [
			// images
			{
				copy: {
					sources: () => DM.payload.store.getSourcesBy('images'),
					to: path.resolve(outputContext, DM.deploy.get().output.folder, 'images')
				}
			},
			// fonts
			{
				copy: {
					sources: () => DM.payload.store.getSourcesBy('fonts'),
					to: path.resolve(outputContext, DM.deploy.get().output.folder, 'fonts')
				}
			},
			// backups
			{
				copy: {
					context: path.resolve(sourceContext, DM.deploy.get().source.size),
					sources: () => DM.deploy.get().settings.assets.backups,
					to: path.resolve(outputContext, DM.deploy.get().output.folder)
				}
			}
			/* TODO: See if wp-plugin-payload can be merged with wp-plugin-assets
			 *
			 */
			// preloader gets inlined, not emitted
			// {
			// 	inline: {
			// 		sources: () => DM.payload.store.get('inline')
			// 	}
			// }
		]
	}
}

module.exports = {
	get
}
