const touch = require('./touch')
const path = require('path')

touch(path.resolve(__dirname, '../../content'), new Date()).then(result => {
    console.log(result)
})


touch(path.resolve(__dirname, '../../content'), new Date(0)).then(result => {
    console.log(result)
})