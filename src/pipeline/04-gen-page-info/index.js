const path = require('upath')
const plugin = require('../../tools/plugin/index')
const configure = require('../../tools/configuration')

function isSubDirectory(parent, child) {
	const parentDirs = parent.split(path.sep).filter((dir) => dir !== '')
	const childDirs = child.split(path.sep).filter((dir) => dir !== '')

	return parentDirs.every((dir, i) => childDirs[i] === dir)
	// return path.relative(child, parent).startsWith('..');
}

const genFileInfo = async (siteInfo, filePath, shouldGetPageInfo) => {
	resolvedFilePath = path.resolve(filePath)
	let baseDir = siteInfo.contentDir
	if (isSubDirectory(siteInfo.staticDir, resolvedFilePath)) {
		baseDir = siteInfo.staticDir
	}
	if (shouldGetPageInfo) {
		return await configure.getPageInfo(baseDir, resolvedFilePath, siteInfo.config)
	}

	return await configure.getAssetInfo(baseDir, resolvedFilePath, siteInfo.config)
}

const createNextPrevPredicate = (siteInfo, pluginList) => {
	return async (assetInfo) => {
		if (assetInfo.config.private) {
			return false
		}

		if (!plugin.isPage(assetInfo.path, pluginList)) {
			return false
		}
		const testPageInfo = await genFileInfo(siteInfo, assetInfo.path, true)
		if (!testPageInfo.text || testPageInfo.text.trim().length === 0) {
			return false
		}

		if (testPageInfo.isUnlisted) {
			return false
		}

		return true
	}
}

const genFilesInfo = async (siteInfo, filePaths, pluginList) => {
	const filesInfo = []
	for (let filePath of filePaths) {
		const resolvedFilePath = path.resolve(filePath)
		const shouldGetPageInfo = plugin.isPage(filePath, pluginList)
		const fileInfo = await genFileInfo(siteInfo, resolvedFilePath, shouldGetPageInfo)

		// add next and previous pages since we have the plugin list
		const pagePredicate = createNextPrevPredicate(siteInfo, pluginList)

		let baseDir = siteInfo.contentDir
		if (isSubDirectory(siteInfo.staticDir, resolvedFilePath)) {
			baseDir = siteInfo.staticDir
		}

		const shouldShowPrevNextPage = shouldGetPageInfo && !fileInfo.private && !fileInfo.isUnlisted

		if (shouldShowPrevNextPage) {
			const previousPageObject = await configure.getPreviousPage(baseDir, filePath, pagePredicate)
			if (previousPageObject) {
				fileInfo.previous = previousPageObject
			}
			const nextPageObject = await configure.getNextPage(baseDir, filePath, pagePredicate)
			if (nextPageObject) {
				fileInfo.next = nextPageObject
			}
		}

		filesInfo.push(fileInfo)
	}

	return filesInfo
}

module.exports = {
	genFileInfo,
	genFilesInfo,
}
