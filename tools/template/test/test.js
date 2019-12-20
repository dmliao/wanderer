const fs = require('fs');
const path = require('path');
const render = require('../index');

const template = fs.readFileSync(path.resolve(__dirname, './test.html'), 'utf-8');

const result = render(template, {
    title: 'Hello World',
    description: 'Testing testing',
    _baseDir: __dirname
});

console.log(result);

const circular = fs.readFileSync(path.resolve(__dirname, './circular1.html'), 'utf-8');

try {
    const result2 = render(circular, {
        _baseDir: __dirname
    });
} catch(e) {
    console.log(e)
}