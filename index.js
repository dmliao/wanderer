const toml = require('toml');
const path = require('path');
const fs = require('fs');

const touch = require('./tools/touch/index')
const build = require('./tools/builder/index')

let config = {
    frame: path.resolve(__dirname, 'frame'),
    content: path.resolve(__dirname, 'content')
};
if (fs.existsSync(path.resolve(__dirname, 'config.toml'))) {
    const extraConfig = toml.parse(fs.readFileSync(path.resolve(__dirname, 'config.toml')));
    config = {...config, ...extraConfig}
}

const buildSite = async() => {
    const touchedFiles = await touch(config.content);

    console.log(touchedFiles)

    for (let file of touchedFiles) {
        build(path.resolve(file.dir, file.file), config, config.content, config.frame, path.resolve(__dirname, 'build'));
    }
}

buildSite()