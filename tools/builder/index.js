const fs = require('fs')
const path = require('upath');

const parseFile = require ('../plugin/index');
const metaExtensions = ['toml']

// cache is optional. If a cache is not provided, we'll create a temporary one
const buildFile = (touchedFile, baseContentDir, baseFrameDir, baseBuildDir, cache) => {
    if (!touchedFile.isModified) {
        return;
    }
    
    const filePath = path.resolve(touchedFile.dir, touchedFile.file)
    const ext = path.parse(touchedFile.file).ext.slice(1)
    const pagePath = path.relative(baseContentDir, filePath)

    // ignore meta files
    if (metaExtensions.indexOf(ext) >= 0) {
        return;
    }

    let config = touchedFile.config

    // short circuit if private = true
    if (config.private && config.private === true) {
        return;
    }
    
    const defaultTargetPath = path.resolve(baseBuildDir, pagePath);
    const defaultTargetDir = path.dirname(defaultTargetPath);
    
    // Determine whether we should change file paths from config
    let targetDir = defaultTargetDir;
    if (config.dir) {
        targetDir = path.resolve(baseBuildDir, config.dir)
        if (config.pageName === 'index' && 
            path.resolve(baseContentDir) !== path.resolve(touchedFile.dir) &&
            path.resolve(baseBuildDir) === path.resolve(targetDir)) {
            // specialcase where if you try to make a directory top-level, we don't want the indexes to collide.
            targetDir = path.resolve(baseBuildDir, config.dir, path.basename(touchedFile.dir))
        }
    }
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true })
    }

    // now with all the preprocessing done, let's build the final file.
    parseFile([], touchedFile, targetDir, baseFrameDir, cache);
}

module.exports = buildFile;