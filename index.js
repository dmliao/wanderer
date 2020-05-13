const path = require('upath')

const genSiteInfo = require('./src/pipeline/01-gen-site-info')
const genTouch = require('./src/pipeline/02-touch')
const genPlugins = require('./src/pipeline/03-gen-plugins')
const genInfo = require('./src/pipeline/04-gen-page-info')
const genCache = require('./src/pipeline/05-cache')
const genBuildFiles = require('./src/pipeline/06-builder')

const wanderer = async (configFile, frameDir, contentDir, cacheDir, buildDir) => {
	const siteInfo = await genSiteInfo(configFile, contentDir, frameDir, cacheDir, buildDir)

	const pluginList = await genPlugins(siteInfo)

	const wandererPass = async (passSiteInfo, touchedFiles) => {
		const filePaths = touchedFiles.map((touchedFile) => {
			return touchedFile.path
		})

		const fileInfos = await genInfo.genFilesInfo(passSiteInfo, filePaths, pluginList)
		const cache = await genCache(passSiteInfo, fileInfos)
		await genBuildFiles(passSiteInfo, fileInfos, pluginList, cache)
	}

	// PASS 1: Frame
	console.log('building frame...')

	// build the frame
	const staticSiteInfo = { ...siteInfo, buildDir: path.resolve(siteInfo.buildDir, 'static') }
	const staticTouchedFiles = await genTouch.genTouchStaticFiles(staticSiteInfo)
	await wandererPass(staticSiteInfo, staticTouchedFiles)

	// PASS 2: CONTENT
	console.log('building content...')
	const contentTouchedFiles = await genTouch.genTouchContentFiles(siteInfo)
	await wandererPass(siteInfo, contentTouchedFiles)
}

module.exports = wanderer
