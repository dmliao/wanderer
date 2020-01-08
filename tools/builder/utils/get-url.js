const path = require('upath')
const processFilename = require('./process-tempo-filename')

const getUrl = (pageObject) => {
    const config = pageObject.config || {}

    const dir = config.dir || path.dirname(pageObject.id)
    const name = config.rename || processFilename(path.parse(path.basename(pageObject.id)).name).name

    return dir + '/' + name
}

module.exports = getUrl