const path = require('path')
const util = require('util')

const generateTree = require('./generate-tree');

generateTree(path.resolve(__dirname, '../../content')).then( tree => {
    console.log(util.inspect(tree, false, null, true /* enable colors */))
})