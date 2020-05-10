const path = require('upath')

const contentPlugin = require('./content')
const assetPlugin = require('./asset')

const ImageParser = require('./parsers/image')
const MDParser = require('./parsers/md')
const CopyParser = require('./parsers/copy')

const loadPluginsFromConfig = require('./lib/load-from-config')
const getContentExtensions = require('./lib/get-content-extensions')
const isPage = require('./lib/is-page')

const runPlugin = async (pluginInstance, siteInfo, fileInfo, targetDirPath, cache) => {
	const type = pluginInstance.getType()
	if (type === 'CONTENT') {
		return await contentPlugin(pluginInstance.parse, siteInfo, fileInfo, targetDirPath, cache)
	}

	return await assetPlugin(pluginInstance.parse, siteInfo, fileInfo, targetDirPath, cache)
}

const copyPlugin = new CopyParser()

const parseFile = async (pluginList, siteInfo, fileInfo, targetDirPath, cache) => {
	if (!pluginList || !pluginList.length) {
		pluginList = [new ImageParser(), new MDParser()]
	}

	const ext = path.parse(fileInfo.path).ext.slice(1)
	let handled = false
	for (let plugin of pluginList) {
		const validExtensions = plugin.getExtensions()
		if (validExtensions.indexOf(ext.toLowerCase()) >= 0) {
			await runPlugin(plugin, siteInfo, fileInfo, targetDirPath, cache)
			handled = true
			break
		}
	}

	if (!handled) {
		// copy file over statically
		await runPlugin(copyPlugin, siteInfo, fileInfo, targetDirPath, cache)
	}
}

module.exports = {
	parseFile,
	getContentExtensions,
	loadPluginsFromConfig,
	isPage,
}
