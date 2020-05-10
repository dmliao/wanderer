const getConfiguration = require('./configuration')
const path = require('upath')

const cacheObj = {};
console.log(getConfiguration(path.resolve('../../test/content'), '../../test/content/different_dir_test/post.md'))
console.log(getConfiguration(path.resolve('../../test/content'), '../../test/content/different_dir_test/post.md', {}, cacheObj))
console.log(cacheObj)
console.log(getConfiguration(path.resolve('../../test/content'), '../../test/content/different_dir_test/index.md', {}, cacheObj))
console.log(cacheObj)