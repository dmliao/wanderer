const fs = require('fs')
const path = require('upath')

const parseFile = require('../plugin/index').parseFile

// cache is optional. If a cache is not provided, we'll create a temporary one
const buildFile = async (siteInfo, fileInfo, pluginList, cache) => {
	let config = fileInfo.config

	// short circuit if private = true
	if (config.private && config.private === true) {
		return
	}

	const pagePath = fileInfo.id

	const defaultTargetPath = path.resolve(siteInfo.buildDir, pagePath)
	const defaultTargetDir = path.dirname(defaultTargetPath)

	// Determine whether we should change file paths from config
	let targetDir = defaultTargetDir
	if (fileInfo.config.dir) {
		targetDir = path.resolve(siteInfo.buildDir, fileInfo.config.dir)
		if (
			fileInfo.pageName === 'index' &&
			// make sure we don't do this for the top-level index files
			path.resolve(siteInfo.contentDir) !== path.resolve(fileInfo.dir) &&
			path.resolve(siteInfo.buildDir) === path.resolve(targetDir)
		) {
			// specialcase where if you try to make a directory top-level, we don't want the indexes to collide.
			targetDir = path.resolve(
				siteInfo.buildDir,
				config.dir,
				path.basename(path.dirname(fileInfo.path))
			)
		}
	}
	if (!fs.existsSync(targetDir)) {
		fs.mkdirSync(targetDir, { recursive: true })
	}

	// now with all the preprocessing done, let's build the final file.
	parseFile(pluginList, siteInfo, fileInfo, targetDir, cache)
}

module.exports = buildFile
