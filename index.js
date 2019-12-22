const toml = require('toml');
const path = require('path');
const fs = require('fs');

var argv = require('minimist')(process.argv.slice(2));

const touch = require('./tools/touch/index')
const build = require('./tools/builder/index')

console.time('build');

if (argv.h || argv.help) {
    console.log('Usage: wanderer -f <frame directory> -i <content directory> -o <out directory> -c <config file>')
    return;
}

const frameDir = argv.frame || argv.f || path.resolve(process.cwd(), 'frame')
const contentDir = argv.in || argv.i || path.resolve(process.cwd(), 'content')
const buildDir = argv.out || argv.o || path.resolve(process.cwd(), 'build')

let config = {
    frame: frameDir,
    content: contentDir
};

const configFile = argv.config || argv.c || path.resolve(process.cwd(), 'config.toml')
if (fs.existsSync(configFile)) {
    const extraConfig = toml.parse(fs.readFileSync(path.resolve(process.cwd(), 'config.toml')));
    config = {...config, ...extraConfig}
}

const buildSite = async() => {

    const touchFile = path.resolve(buildDir, '.touchfile')

    // build all of the static files in the frame
    const staticDir = path.resolve(frameDir, 'static')

    if (fs.existsSync(staticDir)) {
        const staticFiles = await touch(staticDir, touchFile)

        for (let file of staticFiles) {
            build(path.resolve(file.dir, file.file), config, staticDir, config.frame, path.resolve(buildDir, 'static'));
        }
    }

    // build the content files
    // TODO: add touch file.
    const touchedFiles = await touch(config.content, touchFile);

    for (let file of touchedFiles) {
        build(path.resolve(file.dir, file.file), config, config.content, config.frame, buildDir);
    }
}

buildSite().then(() => console.timeEnd('build'))