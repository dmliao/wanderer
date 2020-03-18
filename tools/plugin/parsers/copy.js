const fs = require('fs')
const path = require('upath')

const Plugin = require('../plugin-template');

// simply copies the source file to target directory.
// this parser is used if no extensions match.
class CopyParser extends Plugin {
    getType() {
        return this.types.ASSET;
    }

    getExtensions() {
        return []
    }

    parse(opts) {
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
        const sourceFilePath = path.resolve(touchedFile.dir, touchedFile.file)
        fs.copyFileSync(sourceFilePath, targetFilePath);
    }
}

module.exports = CopyParser;