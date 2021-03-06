const fs = require('fs')
const path = require('upath')
const harpe = require('../harpe/harpe')
const template = require('../template/index')

const findStatics = require('./utils/find-statics')
const createPrettyUrlPage = require('./utils/create-pretty-url-page')

const plugin = async (pluginFunction, siteInfo, fileInfo, targetDirPath, cache) => {
	let pageObject = cache.getPage(fileInfo.id)

	if (!pageObject) {
		await cache.update([fileInfo])
		pageObject = cache.getPage(fileInfo.id)
	}

	if (!pageObject) {
		// we assume at this point that the page is deliberately being uncached, and thus should
		// short-circuit here
		return
	}

	const parsedConfig = pageObject.config

	// handle file-level configuration
	///////////////////////////////////

	if (parsedConfig.private && parsedConfig.private === true) {
		// skip this, since it's a private file
		return
	}

	processedFilename = parsedConfig.rename || pageObject.pageName

	/**
	 * genPageStatics - creates a file that contains static files associated with the page.
	 * static files are files that have the same name as a content file.
	 * @returns pageStatics {
	 *  css: path to css file
	 *  js: path to js file
	 *  statics: [list of other static files]
	 * }
	 */
	const genPageStatics = () => {
		const sourceFilePath = path.resolve(pageObject.path)

		// figure out if we should add css / js files
		const pageStatics = findStatics(sourceFilePath)
		return pageStatics
	}

	/**
	 * genFeeds - creates feeds that can be used in layouts in content pages
	 */
	const genFeeds = () => {
		// generate all of the feeds
		//////////////////////////////
		const feeds = {}
		if (parsedConfig.feeds) {
			for (let feedName of Object.keys(parsedConfig.feeds)) {
				const feed = parsedConfig.feeds[feedName]
				// if the feed query is a string, we need to generate a query from it
				const rawQuery = feed.query
				let query

				if (typeof rawQuery === 'string') {
					const relativeDir = path.join(path.dirname(pageObject.id), rawQuery)
					query = { sourceDir: relativeDir }
				} else {
					query = rawQuery
				}

				feeds[feedName] = cache.getFeed({
					query,
					sortBy: feed.sortBy,
					isAscending: feed.isAscending,
					limit: feed.limit,
				})
			}
		}

		return feeds
	}

	/**
	 * genLayout - produces layout text based on input configuration
	 * @returns layoutText - string with the layout that can be processed with template.
	 */
	const genLayout = () => {
		// find the layout
		const layout = parsedConfig.layout || 'default'

		const layoutPath = path.resolve(siteInfo.frameDir, 'layouts', layout + '.html')
		let layoutText = '${o.content}'
		if (fs.existsSync(layoutPath)) {
			layoutText = fs
				.readFileSync(path.resolve(siteInfo.frameDir, 'layouts', layout + '.html'))
				.toString()
		}

		return layoutText
	}

	/**
	 * genBuild - creates the output file in the correct location for pretty URLs.
	 * @param {string} content - string with the file's contents
	 * @param {string} extension - file extension to use (without the leading .)
	 */
	const genBuild = (content, extension) => {
		const targetPath = path.resolve(targetDirPath, processedFilename + extension)
		// we really don't need to create a pretty URL page for an index
		if (['index', '404'].indexOf(processedFilename) <= -1) {
			createPrettyUrlPage(targetPath, content)
		} else {
			// write the file
			fs.writeFileSync(targetPath, content)
		}
	}

	// call the pluginFunction
	pluginFunction({
		// base inputs
		siteInfo,
		targetDirPath,
		pageObject,

		// generator functions
		genPageStatics,
		genBuild,
		genFeeds,
		genLayout,

		// helper libraries
		harpe,
		template,
	})
}

module.exports = plugin
