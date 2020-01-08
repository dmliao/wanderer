const getUrl = require('./get-url')

console.log(getUrl({
    config: {},
    id: 'canonical/path/file.md'
}))

console.log(getUrl({
    id: 'path/19k14-tempofile.md'
}))

console.log(getUrl({
    config: {
        dir: 'test/dir',
    },
    id: 'not/canonical/path.md'
}))

console.log(getUrl({
    config: {
        rename: 'renamed'
    },
    id: 'path/is/named.md'
}))