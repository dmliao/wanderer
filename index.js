

const touch = require('./tools/touch/index')
const build = require('./tools/builder/index')

const path = require('upath');
const fs = require('fs');

const Cache = require('./tools/cache/cache')

const wanderer = async(config, frameDir, contentDir, cacheDir, buildDir) => {

    const globalConfig = { ...config }

    const touchFile = path.resolve(cacheDir, '.touchfile')

    // build all of the static files in the frame
    const staticDir = path.resolve(frameDir, 'static')

    if (fs.existsSync(staticDir)) {
        const staticFiles = await touch(staticDir, globalConfig, touchFile)
        const staticCache = new Cache(path.resolve(cacheDir, 'static'), frameDir)
        staticCache.update(staticFiles)

        await Promise.all(staticFiles.map(async file => {
            return build(file, staticDir, frameDir, path.resolve(buildDir, 'static'), staticCache);
        }))

        staticCache.save()
    }

    // build the content files
    const touchedFiles = await touch(contentDir, globalConfig, touchFile, true);

    const cache = new Cache(cacheDir, contentDir)
    cache.update(touchedFiles)

    // once the cache is created all the files should be able to build independently
    // so let's do it asynchronously
    await Promise.all(touchedFiles.map(async file => {
        return build(file, contentDir, frameDir, buildDir, cache)
    }))

    cache.save()
}

module.exports = wanderer;