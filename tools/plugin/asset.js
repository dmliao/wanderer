const plugin = (pluginFunction, touchedFile, targetDirPath, baseFrameDir, cache) => {
    const cacheDirectory = cache ? cache.getDirectory() : '';
    // call the pluginFunction
    pluginFunction({
        // base inputs
        touchedFile,
        baseFrameDir,
        targetDirPath,
        cacheDirectory
    });
}

module.exports = plugin;