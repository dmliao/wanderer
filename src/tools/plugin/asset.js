const path = require('upath')
const configure = require('../configuration')

const plugin = async (pluginFunction, siteInfo, fileInfo, targetDirPath, cache) => {
	const cacheDirectory = cache ? cache.getDirectory() : ''
	// call the pluginFunction
	pluginFunction({
		// base inputs
		siteInfo,
		fileInfo,
		targetDirPath,
		cacheDirectory,
	})
}

module.exports = plugin
