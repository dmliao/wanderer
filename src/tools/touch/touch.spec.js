const touch = require('./touch')
const path = require('path')

touch(path.resolve(__dirname, '../../test/content'), {}, new Date()).then(result => {
    console.log(result)
})


touch(path.resolve(__dirname, '../../test/content'), {}, new Date(0)).then(result => {
    console.log(result)
})