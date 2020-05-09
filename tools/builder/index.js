const fs = require('fs')
const path = require('upath')

const configure = require('../configuration')
const parseFile = require('../plugin/index')
const metaExtensions = ['toml']

// cache is optional. If a cache is not provided, we'll create a temporary one
const buildFile = async (
	pluginList,
	touchedFile,
	globalConfig,
	baseContentDir,
	baseFrameDir,
	baseBuildDir,
	cache
) => {
	if (!touchedFile.isModified) {
		return
	}

	const filePath = touchedFile.path
	const ext = path.parse(touchedFile.path).ext.slice(1)
	const pagePath = path.relative(baseContentDir, filePath)

	// ignore meta files
	if (metaExtensions.indexOf(ext) >= 0) {
		return
	}

	let config = await configure.getConfiguration(baseContentDir, filePath, {});

	// short circuit if private = true
	if (config.private && config.private === true) {
		return
	}

	const defaultTargetPath = path.resolve(baseBuildDir, pagePath)
	const defaultTargetDir = path.dirname(defaultTargetPath)

	let assetInfo = await configure.getAssetInfo(baseContentDir, filePath, {});

	// Determine whether we should change file paths from config
	let targetDir = defaultTargetDir
	if (assetInfo.config.dir) {
		targetDir = path.resolve(baseBuildDir, assetInfo.config.dir)
		if (
			assetInfo.pageName === 'index' &&
			path.resolve(baseContentDir) !== path.resolve(assetInfo.config.dir) &&
			path.resolve(baseBuildDir) === path.resolve(targetDir)
		) {
			// specialcase where if you try to make a directory top-level, we don't want the indexes to collide.
			targetDir = path.resolve(
				baseBuildDir,
				config.dir,
				path.basename(assetInfo.config.dir)
			)
		}
	}
	if (!fs.existsSync(targetDir)) {
		fs.mkdirSync(targetDir, { recursive: true })
	}

	// now with all the preprocessing done, let's build the final file.
	parseFile(pluginList, touchedFile, targetDir, baseContentDir, baseFrameDir, cache)
}

module.exports = buildFile
