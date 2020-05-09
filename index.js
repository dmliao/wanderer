const touch = require('./tools/touch/index')
const build = require('./tools/builder/index')

const path = require('upath')
const fs = require('fs')

const loadPluginsFromConfig = require('./tools/plugin/load-from-config')
const Cache = require('./tools/cache/cache')

const buildWandererDirectory = async (
	config,
	pluginList,
	contentDir,
	cacheDir,
	frameDir,
	buildDir,
	touchFile,
	shouldUpdateTouchFile
) => {
	const cache = new Cache(cacheDir)
	cache.setContentExtensions(pluginList)
	cache.setGlobalConfig(config)

	// build the content files
	const touchedFiles = await touch(
		contentDir,
		touchFile,
		shouldUpdateTouchFile
	)

	await cache.update(contentDir, touchedFiles)

	// once the cache is created all the files should be able to build independently
	// so let's do it asynchronously
	await Promise.all(
		touchedFiles.map(async (file) => {
			return await build(
				pluginList,
				file,
				config,
				contentDir,
				frameDir,
				buildDir,
				cache
			)
		})
	)

	cache.save()
}

const wanderer = async (config, frameDir, contentDir, cacheDir, buildDir) => {
	const globalConfig = { ...config }

	const touchFile = path.resolve(cacheDir, '.touchfile')

	// build all of the static files in the frame
	const staticDir = path.resolve(frameDir, 'static')

	// get the plugins and create the cache
	const pluginList = loadPluginsFromConfig(globalConfig)

	if (fs.existsSync(staticDir)) {
		await buildWandererDirectory(
			globalConfig,
			pluginList,
			staticDir,
			path.resolve(cacheDir, 'static'),
			frameDir,
			path.resolve(buildDir, 'static'),
			touchFile,
			false
		)
	}

	await buildWandererDirectory(
		globalConfig,
		pluginList,
		contentDir,
		cacheDir,
		frameDir,
		buildDir,
		touchFile,
		true
	)
}

module.exports = wanderer
