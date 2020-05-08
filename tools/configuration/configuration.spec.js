const touch = require('../touch/touch')
const getConfiguration = require('./configuration')
const path = require('upath')

touch(path.resolve(__dirname, '../../test/content'), {}, new Date()).then(result => {
	const cacheObj = {};
	console.log(getConfiguration(path.resolve('../../test/content'), '../../test/content/different_dir_test/post.md'))
	console.log(getConfiguration(path.resolve('../../test/content'), '../../test/content/different_dir_test/post.md', cacheObj))
	console.log(cacheObj)
	console.log(getConfiguration(path.resolve('../../test/content'), '../../test/content/different_dir_test/index.md', cacheObj))
	console.log(cacheObj)
})
