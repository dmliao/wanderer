const path = require('upath')

const genSiteInfo = require('../pipeline/01-gen-site-info')
const genPlugins = require('../pipeline/03-gen-plugins')
const genInfo = require('../pipeline/04-gen-page-info')

const pageInfoTool = async (configFile, frameDir, contentDir, targetFile) => {
	const siteInfo = await genSiteInfo(
		configFile,
		contentDir,
		frameDir,
		path.resolve('.'),
		path.resolve('.')
	)
	const pluginList = await genPlugins(siteInfo)
	const pageInfo = await genInfo.genFilesInfo(siteInfo, [targetFile], pluginList)
	return pageInfo[0]
}

module.exports = pageInfoTool
