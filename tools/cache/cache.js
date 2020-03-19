const TAFFY = require('taffydb').taffy
const fs = require('fs')
const path = require('upath')
const frontmatter = require('../frontmatter/index')
const globals = require('../common/globals')
class Cache {
	constructor(cacheDir) {
		this.cacheDir = path.resolve(cacheDir)
		this.contentExtensions = ['md', 'htm']

		this.pageCachePath = path.join(this.cacheDir, 'pages.json')
		if (fs.existsSync(this.pageCachePath)) {
			this.pageCache = TAFFY(fs.readFileSync(this.pageCachePath, 'utf-8'))
		} else {
			this.pageCache = TAFFY()
		}
	}

	setContentExtensions(pluginList) {
		let extensions = []
		for (let plugin of pluginList) {
			if (plugin.getType() !== plugin.types.CONTENT) {
				continue
			}
			const newExtensions = plugin.getExtensions()
			extensions = extensions.concat(newExtensions)
		}
		this.contentExtensions = Array.from(new Set([...extensions]))
	}

	getDirectory() {
		return this.cacheDir
	}

	save() {
		if (!fs.existsSync(this.cacheDir)) {
			fs.mkdirSync(this.cacheDir, { recursive: true })
		}

		fs.writeFileSync(this.pageCachePath, this.pageCache().stringify())
	}

	update(touchedFiles) {
		let previousFile = undefined
		for (let file of touchedFiles) {
			if (!file.isModified) {
				continue
			}

			const ext = path
				.extname(file.file)
				.toLowerCase()
				.slice(1)
			if (this.contentExtensions.indexOf(ext) < 0) {
				continue
			}

			const filePath = path.resolve(file.dir, file.file)

			const content = frontmatter(fs.readFileSync(filePath, 'utf-8'))

			if (content.config.private && content.config.private === true) {
				continue
			}

			// skip files that are all whitespace...
			if (!content.text || content.text.trim().length === 0) {
				continue
			}

			content.config = { ...file.config, ...content.config }

			// TODO: we need to have run tempo by now to get the proper dates for prefixed posts.
			content.date = content.config.date.getTime()
			content.id = file.id
			content.sourceDir = path.dirname(file.id)

			// get the title
			if (content.config.title) {
				content.title = content.config.title
			} else if (content.text.trim().startsWith('# ')) {
				content.title = content.text
					.trim()
					.split(/\r\n|\r|\n/g)[0]
					.slice(2)
					.trim()
			} else {
				content.title = file.config.pageName
			}

			content.config.title = content.title

			// get the URL
			const pathDir = content.config.dir || content.sourceDir
			const pathEnd = content.config.rename || content.config.pageName
			content.url = [
				pathDir === '.' ? '' : pathDir,
				pathEnd === 'index' ? '' : pathEnd
			].join('/')

			// add tags to top-level to allow querying
			content.tags = content.config.tags

			if (!content.url.startsWith('/')) {
				content.url = '/' + content.url
			}

			// add previous and next pages.
			const previousPage =
				previousFile && previousFile.dir === file.dir
					? previousFile.id
					: undefined

			let shouldShowPrevNext = true
			for (let name of globals.specialFilenames) {
				if (file.file.startsWith(name)) {
					shouldShowPrevNext = false
					break
				}
			}

			if (previousPage && shouldShowPrevNext) {
				const previousPageObject = this.getPage(previousPage)
				if (previousPageObject) {
					content.config.previous = {
						url: previousPageObject.url,
						id: previousPageObject.id,
						title: previousPageObject.title
					}

					previousPageObject.config.next = {
						url: content.url,
						id: content.id,
						title: content.title
					}

					// save the previous page object
					this.pageCache.merge(previousPageObject, 'id')
				}
			}

			this.pageCache.merge(content, 'id')
			if (shouldShowPrevNext) {
				previousFile = file
			}
		}
	}

	db(query) {
		return this.pageCache(query)
	}

	global() {
		return this.pageCache
	}

	getPage(id) {
		const pages = JSON.parse(
			this.pageCache({ id: id })
				.limit(1)
				.stringify()
		)
		if (!pages.length) {
			return undefined
		}
		return pages[0]
	}

	getFeed({ query, sortBy, isAscending, limit, pageNumber }) {
		if (!query) {
			throw new Error('no query?')
		}

		sortBy = sortBy || 'date'
		const sortType = isAscending ? 'asec' : 'desc'
		limit = limit || 1000 // if a site goes over this number we're really in trouble
		pageNumber = pageNumber || 0 // 0 indexed
		const pages = JSON.parse(
			this.pageCache(query)
				.limit(limit)
				.start(limit * pageNumber)
				.order(sortBy + ' ' + sortType)
				.stringify()
		)

		return pages
	}
}

module.exports = Cache
