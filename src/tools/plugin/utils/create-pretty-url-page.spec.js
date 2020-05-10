const path = require('path')
const fs = require('fs')
const createPrettyUrlPage = require('./create-pretty-url-page')

const testPath = path.resolve(__dirname, '../../../build/blog_test/kitchen-sink.html')
const html = fs.readFileSync(testPath).toString()
console.log(html)
console.log(createPrettyUrlPage.test(html))