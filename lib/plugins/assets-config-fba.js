const path = require('path')

const { IMAGES, FONTS } = require('../utils/patterns.js')

const debug = require('@ff0000-ad-tech/debug')
const log = debug('DM:plugins:assets-config-fba')

const get = (DM, sourceContext, outputContext) => {
	return {
		aggregators: [
			{
				entry: 'build',
				filter: {
					type: 'fbAi',
					include: IMAGES
				},
				store: (type, assetPath) => {
					DM.payload.watchAsset(type, assetPath)
				},
				setter: () => {
					DM.deploy.get().settings.assets.binaries = ['./fba-payload.png']
				}
			},
			{
				entry: 'build',
				filter: {
					type: 'fbAf',
					include: FONTS
				},
				store: (type, assetPath) => {
					DM.payload.watchAsset(type, assetPath)
				},
				setter: () => {
					DM.deploy.get().settings.assets.binaries = ['./fba-payload.png']
				}
			}
		],
		emitters: [
			// images
			{
				fba: {
					type: 'fbAi',
					sources: () => DM.payload.store.getSourcesBy('fbAi'),
					to: path.resolve(outputContext, DM.deploy.get().output.folder, 'fba-payload.png')
				}
			},
			// fonts
			{
				fba: {
					type: 'fbAf',
					sources: () => DM.payload.store.getSourcesBy('fbAf'),
					to: path.resolve(outputContext, DM.deploy.get().output.folder, 'fba-payload.png')
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
