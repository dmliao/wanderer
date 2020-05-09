const path = require('upath')
const configure = require('../configuration')

const plugin = async (pluginFunction, touchedFile, targetDirPath, baseContentDir, baseFrameDir, cache) => {
    // TODO: we need to pipe globalConfig here too...
    const assetInfo = await configure.getAssetInfo(baseContentDir, touchedFile.path)
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