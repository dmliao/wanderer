const path = require('upath')
const getContentExtensions = require('./get-content-extensions')

const isPage = (filepath, pluginList) => {
	const resolvedPath = path.resolve(filepath)
	const ext = path.extname(resolvedPath).toLowerCase().slice(1)

	const contentExtensions = getContentExtensions(pluginList)
	return contentExtensions.indexOf(ext) >= 0
}

module.exports = isPage
