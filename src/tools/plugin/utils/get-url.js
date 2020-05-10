const path = require('upath')

const getUrl = (pageObject) => {
	const config = pageObject.config || {}

	const dir = config.dir || path.dirname(pageObject.id)
	const name = config.rename || config.pageName

	return dir + '/' + name
}

module.exports = getUrl
