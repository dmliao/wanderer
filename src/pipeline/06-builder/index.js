const builder = require('../../tools/builder/index')

const genBuildFiles = async (siteInfo, fileInfos, pluginList, cache) => {
	return await Promise.all(
		fileInfos.map(async (fileInfo) => {
			return await builder(siteInfo, fileInfo, pluginList, cache)
		})
	)
}

module.exports = genBuildFiles
