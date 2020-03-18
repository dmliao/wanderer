const fs = require('fs')
const path = require('upath')
const dayjs = require('dayjs');

const processImage = require('../../image-processor/index')

const parseImageFile = (opts) => {
    const {
        // base inputs
        touchedFile,
        baseFrameDir,
        targetDirPath,
        cacheDirectory
    } = opts;

    const config = touchedFile.config;
    const ext = path.parse(touchedFile.file).ext.slice(1);
    const targetFilePath = path.resolve(targetDirPath, config.pageName + '.' + ext)

    if (cacheDirectory) {
        const cacheFilename = touchedFile.id.replace(/\//gm, '_');
        const cacheFilePath = path.resolve(cacheDirectory, cacheFilename);
    
        if (fs.existsSync(cacheFilePath)) {
            const cacheUpdatedTime = fs.statSync(cacheFilePath).mtime
            if (dayjs(touchedFile.config.updated).isBefore(cacheUpdatedTime)) {
                // the cache is newer than the image, we can just use the cache image
                if (path.resolve(cacheFilePath) !== path.resolve(targetFilePath)) {
                    fs.copyFileSync(cacheFilePath, targetFilePath);
                }
                return;
            }
        }
        
        // we need to recreate the cached image
        processImage(path.resolve(touchedFile.dir, touchedFile.file), cacheFilePath).then(() => {
            if (path.resolve(cacheFilePath) !== path.resolve(targetFilePath)) {
                fs.copyFileSync(cacheFilePath, targetFilePath)
            }
        })
    } else {
        processImage(path.resolve(touchedFile.dir, touchedFile.file), targetFilePath)
    }
}

module.exports = parseImageFile