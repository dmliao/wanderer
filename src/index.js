const genSiteInfo = require('./pipeline/01-gen-site-info')
const genTouch = require('./pipeline/02-touch')
const genPlugins = require('./pipeline/03-gen-plugins')
const genInfo = require('./pipeline/04-gen-page-info')
const genCache = require('./pipeline/05-cache')
const genBuildFiles = require('./pipeline/06-builder')

const wanderer = async (configFile, frameDir, contentDir, cacheDir, buildDir) => {
	const siteInfo = await genSiteInfo(configFile, contentDir, frameDir, cacheDir, buildDir)

	const pluginList = await genPlugins(siteInfo)

	const wandererPass = async (touchedFiles) => {
		const filePaths = touchedFiles.map((touchedFile) => {
			return touchedFile.path
		})

		const fileInfos = await genInfo.genFilesInfo(siteInfo, filePaths, pluginList)
		const staticCache = await genCache(siteInfo, fileInfos)
		await genBuildFiles(siteInfo, fileInfos, pluginList, staticCache)
	}

	// PASS 1: Frame
	console.log('building frame...')

	// build the frame
	const staticTouchedFiles = await genTouch.genTouchStaticFiles(siteInfo)
	await wandererPass(staticTouchedFiles)

	// PASS 2: CONTENT
	console.log('building content...')
	const contentTouchedFiles = await genTouch.genTouchContentFiles(siteInfo)
	await wandererPass(contentTouchedFiles)
}
/*
wanderer('../test/config.toml', '../test/content', '../test/frame', '../.cache', '../test/build')
*/

module.exports = wanderer
