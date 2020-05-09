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
        console.log(targetDirPath);
        console.log(targetFilePath)
        
    
        if (cacheDirectory) {
            const cacheFilename = assetInfo.id.replace(/\//gm, '_');
            const cacheFilePath = path.resolve(cacheDirectory, cacheFilename);

            console.log(cacheFilename);
            console.log(cacheFilePath)
            console.log(assetInfo.updated)
        
            if (fs.existsSync(cacheFilePath)) {
                const cacheUpdatedTime = fs.statSync(cacheFilePath).mtime
                if (dayjs(assetInfo.updated).isBefore(cacheUpdatedTime)) {
                    // the cache is newer than the image, we can just use the cache image
                    console.log('retrieving cached image')
                    if (path.resolve(cacheFilePath) !== path.resolve(targetFilePath)) {
                        fs.copyFileSync(cacheFilePath, targetFilePath);
                    }
                    return;
                }
            }
            
            // we need to recreate the cached image
            processImage(path.resolve(assetInfo.path), cacheFilePath).then(() => {
                if (path.resolve(cacheFilePath) !== path.resolve(targetFilePath)) {
                    fs.copyFileSync(cacheFilePath, targetFilePath)
                }
            })
        } else {
            processImage(path.resolve(assetInfo.path), targetFilePath)
        }
    }
}

module.exports = ImageParser;