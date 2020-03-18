const path = require('path')
const findStatics = require('./find-statics')

console.log(findStatics(path.resolve(__dirname, '../../../content/blog_test/styletest.md')))
// should give us the css associated with it