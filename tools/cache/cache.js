const TAFFY = require('taffydb').taffy
const fs = require('fs')
const path = require('upath')
const globals = require('../common/globals')
const configure = require('../configuration')
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

	async update(baseDir, touchedFiles) {
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

			const pageInfo = await configure.getPageInfo(baseDir, filePath)
			if (pageInfo.config.private && pageInfo.config.private === true) {
				continue
			}

			// skip files that are all whitespace...
			if (!pageInfo.text || pageInfo.text.trim().length === 0) {
				continue
			}

			// add tags to top-level to allow querying
			pageInfo.tags = pageInfo.config.tags

			let shouldShowPrevNext = true
			for (let name of globals.specialFilenames) {
				if (file.file.startsWith(name)) {
					shouldShowPrevNext = false
					break
				}
			}

			const pagePredicate = async (assetInfo) => {
				const testExt = path.extname(assetInfo.path).toLowerCase().slice(1);
				if (this.contentExtensions.indexOf(testExt) < 0) {
					return false;
				}
				const testPageInfo = await configure.getPageInfo(baseDir, assetInfo.path);
				if (!testPageInfo.text || testPageInfo.text.trim().length === 0) {
					return false;
				}

				for (let name of globals.specialFilenames) {
					if (assetInfo.file.startsWith(name)) {
						return false;
					}
				}

				return true;
			};

			if (shouldShowPrevNext) {
				const previousPageObject = await configure.getPreviousPage(baseDir, filePath, pagePredicate)
				if (previousPageObject) {
					pageInfo.previous = previousPageObject;
				}
				const nextPageObject = await configure.getNextPage(baseDir, filePath, pagePredicate)
				if (nextPageObject) {
					pageInfo.next = nextPageObject;
				}
			}

			this.pageCache.merge(pageInfo, 'id')
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
