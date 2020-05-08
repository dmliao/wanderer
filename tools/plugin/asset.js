const path = require('upath')
const configure = require('../configuration')

const plugin = async (pluginFunction, touchedFile, targetDirPath, baseContentDir, baseFrameDir, cache) => {
    const assetInfo = await configure.getAssetInfo(baseContentDir, path.resolve(touchedFile.dir, touchedFile.file))
    const cacheDirectory = cache ? cache.getDirectory() : '';
    // call the pluginFunction
    pluginFunction({
        // base inputs
        assetInfo,
        baseFrameDir,
        baseContentDir,
        targetDirPath,
        cacheDirectory
    });
}

module.exports = plugin;