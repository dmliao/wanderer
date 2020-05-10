const TAFFY = require('taffydb').taffy
const fs = require('fs')
const path = require('upath')

class Cache {
	constructor(siteInfo) {
		this.siteInfo = siteInfo

		this.pageCachePath = path.join(this.siteInfo.cacheDir, 'pages.json')
		if (fs.existsSync(this.pageCachePath)) {
			this.pageCache = TAFFY(fs.readFileSync(this.pageCachePath, 'utf-8'))
		} else {
			this.pageCache = TAFFY()
		}
	}

	setGlobalConfig(config) {
		this.globalConfig = config
	}

	getDirectory() {
		return this.siteInfo.cacheDir
	}

	save() {
		if (!fs.existsSync(this.cacheDir)) {
			fs.mkdirSync(this.cacheDir, { recursive: true })
		}

		fs.writeFileSync(this.pageCachePath, this.pageCache().stringify())
	}

	update(fileInfos) {
		for (let fileInfo of fileInfos) {
			if (!fileInfo.isPage) {
				continue
			}

			if (fileInfo.config.private && fileInfo.config.private === true) {
				continue
			}

			// skip files that are all whitespace...
			if (!fileInfo.text || fileInfo.text.trim().length === 0) {
				continue
			}

			// add tags to top-level to allow querying
			fileInfo.tags = fileInfo.config.tags

			this.pageCache.merge(fileInfo, 'id')
		}
	}

	db(query) {
		return this.pageCache(query)
	}

	global() {
		return this.pageCache
	}

	getPage(id) {
		const pages = JSON.parse(this.pageCache({ id: id }).limit(1).stringify())
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
