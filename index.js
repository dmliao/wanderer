const toml = require('toml');
const path = require('path');
const fs = require('fs');

var argv = require('minimist')(process.argv.slice(2));

const touch = require('./tools/touch/index')
const build = require('./tools/builder/index')

const Cache = require('./tools/cache/cache')

console.time('build');

if (argv.h || argv.help) {
    console.log('Usage: wanderer -f <frame directory> -i <content directory> -o <out directory> -c <config file>')
    return;
}

const frameDir = argv.frame || argv.f || path.resolve(process.cwd(), 'frame')
const contentDir = argv.in || argv.i || path.resolve(process.cwd(), 'content')
const buildDir = argv.out || argv.o || path.resolve(process.cwd(), 'build')
const cacheDir = argv.out || argv.o || path.resolve(process.cwd(), '.cache')

let metaConfig = {
};

const configFile = argv.config || argv.c || path.resolve(process.cwd(), 'config.toml')
if (fs.existsSync(configFile)) {
    const extraConfig = toml.parse(fs.readFileSync(path.resolve(process.cwd(), 'config.toml')));
    metaConfig = {...metaConfig, ...extraConfig}
}

const buildSite = async() => {

    const globalConfig = { ...metaConfig }

    const touchFile = path.resolve(buildDir, '.touchfile')

    // build all of the static files in the frame
    const staticDir = path.resolve(frameDir, 'static')

    if (fs.existsSync(staticDir)) {
        const staticFiles = await touch(staticDir, globalConfig, touchFile)
        const staticCache = new Cache(path.resolve(cacheDir, 'static'), frameDir)
        staticCache.update(staticFiles)

        for (let file of staticFiles) {
            build(file, staticDir, frameDir, path.resolve(buildDir, 'static'), staticCache);
        }

        staticCache.save()
    }

    // build the content files
    const touchedFiles = await touch(contentDir, globalConfig, touchFile, true);

    const cache = new Cache(cacheDir, contentDir)
    cache.update(touchedFiles)

    for (let file of touchedFiles) {
        build(file, contentDir, frameDir, buildDir, cache);
    }

    cache.save()
}

buildSite().then(() => console.timeEnd('build'))
