const Cache = require('../../tools/cache/cache')

const genCache = (siteInfo, fileInfos) => {
	const cache = new Cache(siteInfo)
	cache.update(fileInfos)

	return cache
}

module.exports = genCache
