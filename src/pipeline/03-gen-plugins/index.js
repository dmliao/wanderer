const plugin = require('../../tools/plugin/index')

const genPlugins = async (siteInfo) => {
	const pluginList = plugin.loadPluginsFromConfig(siteInfo.config)
	return pluginList
}

module.exports = genPlugins
