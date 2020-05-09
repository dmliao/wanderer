const path = require('path')
const Cache = require('./cache')
const touch = require('../touch/touch')

const cache = new Cache(path.resolve(__dirname, 'test-cache'), path.resolve(__dirname, '../../content'))

test = async () => {

    touch(path.resolve(__dirname, '../../test/content'), new Date(0)).then(async result => {
        await cache.update('../../test/content', result)
        console.log(result)
    
        console.log(cache.db({ sourceDir: "secret" }).stringify())
        console.log(cache.db({ pageName: 'feed' }).stringify())
        console.log(cache.db({ tags: {like: "index"} }).stringify())
    })
    
    
}

test()