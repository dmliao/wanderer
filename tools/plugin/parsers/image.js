const fs = require('fs')
const path = require('upath')
const dayjs = require('dayjs');

const processImage = require('../../image-processor/index')

const Plugin = require('../plugin-template');

class ImageParser extends Plugin {
    getType() {
        return this.types.ASSET;
    }

    getExtensions() {
        return ['jpg', 'png']
    }

    parse(opts) {
        const {
            // base inputs
            assetInfo,
            baseContentDir,
            baseFrameDir,
            targetDirPath,
            cacheDirectory
        } = opts;
    
        const ext = path.parse(assetInfo.file).ext.slice(1);
        const targetFilePath = path.resolve(targetDirPath, assetInfo.pageName + '.' + ext)
    
        if (cacheDirectory) {
            const cacheFilename = assetInfo.id.replace(/\//gm, '_');
            const cacheFilePath = path.resolve(cacheDirectory, cacheFilename);
        
            if (fs.existsSync(cacheFilePath)) {
                const cacheUpdatedTime = fs.statSync(cacheFilePath).mtime
                if (dayjs(assetInfo.updated).isBefore(cacheUpdatedTime)) {
                    // the cache is newer than the image, we can just use the cache image
                    if (path.resolve(cacheFilePath) !== path.resolve(targetFilePath)) {
                        fs.copyFileSync(cacheFilePath, targetFilePath);
                    }
                    return;
                }
            }
            
            // we need to recreate the cached image
            processImage(path.resolve(assetInfo.dir, assetInfo.file), cacheFilePath).then(() => {
                if (path.resolve(cacheFilePath) !== path.resolve(targetFilePath)) {
                    fs.copyFileSync(cacheFilePath, targetFilePath)
                }
            })
        } else {
            processImage(path.resolve(assetInfo.dir, assetInfo.file), targetFilePath)
        }
    }
}

module.exports = ImageParser;