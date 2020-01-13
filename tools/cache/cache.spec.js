const path = require('path')
const Cache = require('./cache')
const touch = require('../touch/touch')

const cache = new Cache(path.resolve(__dirname, 'test-cache'), path.resolve(__dirname, '../../content'))

touch(path.resolve(__dirname, '../../content'), {}, new Date(0)).then(result => {
    cache.update(result)
    console.log(result)

    console.log(cache.db({ config: { dir: "secret" } }).stringify())
    console.log(cache.db({ config: {pageName: 'feed'}}).stringify())
    console.log(cache.db({ tags: {like: "index"} }).stringify())
})

