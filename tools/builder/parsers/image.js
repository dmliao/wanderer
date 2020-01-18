const fs = require('fs')
const path = require('upath')
const dayjs = require('dayjs');

const processImage = require('../../image-processor/index')

const parseImageFile = (touchedFile, targetFilePath, cacheDir) => {
    if (cacheDir) {
        const cacheFilename = touchedFile.id.replace('/', '_');
        const cacheFilePath = path.resolve(cacheDir, cacheFilename);
    
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