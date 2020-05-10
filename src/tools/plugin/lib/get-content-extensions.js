const getContentExtensions = (pluginList) => {
	let extensions = []
	for (let plugin of pluginList) {
		if (plugin.getType() !== plugin.types.CONTENT) {
			continue
		}
		const newExtensions = plugin.getExtensions()
		extensions = extensions.concat(newExtensions)
	}
	return Array.from(new Set([...extensions]))
}

module.exports = getContentExtensions
