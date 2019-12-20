const path = require('path');
const walk = require('./walk');

const fileCallback = (file, dir) => {
    console.log(file, dir);
}

walk(path.resolve(__dirname, '../../..', 'content'), fileCallback).then(files => {
    console.log(files);
});