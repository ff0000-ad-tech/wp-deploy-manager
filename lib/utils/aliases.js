const path = require('path')
const fs = require('fs')

const isDirectory = basePath => filename => {
	const fullPath = path.resolve(basePath, filename)
	return fs.statSync(fullPath).isDirectory()
}

function getTopLevel(nodeModules) {
	const folders = fs.readdirSync(nodeModules).filter(isDirectory(nodeModules))
	const aliasObj = folders.reduce((obj, folder) => {
		obj[folder] = path.resolve(nodeModules, folder)
		return obj
	}, {})
	return aliasObj
}

module.exports = {
	getTopLevel,
}
