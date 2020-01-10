const fs = require('fs')
const path = require('path');

const buildMarkdownFile = require('./parsers/md')

const processImage = require('../image-processor/index')

const imageExtensions = ['png', 'jpg']
const metaExtensions = ['toml']
const processedEntryExtensions = ['md', 'htm']

// cache is optional. If a cache is not provided, we'll create a temporary one
const buildFile = (touchedFile, baseContentDir, baseFrameDir, baseBuildDir, cache) => {
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
    const targetDir = config.dir ? path.resolve(baseBuildDir, config.dir) : defaultTargetDir
    
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true })
    }

    // image
    if (imageExtensions.indexOf(ext.toLowerCase()) >= 0) {
        processImage(filePath, path.resolve(targetDir, config.pageName + '.' + ext))
        return;
    }

    if (processedEntryExtensions.indexOf(ext.toLowerCase()) < 0) {
        // it's static. We copy over the file without doing anything (though we do strip tempo dates if needed)
        buildStaticFile(filePath, path.resolve(targetDir, config.pageName + '.' + ext));
        return;
    }

    // markdown
    if (ext === 'md') {
        buildMarkdownFile(touchedFile, targetDir, baseFrameDir, cache);
        return
    }

    // htm

    // html
    if (ext === 'html') {
        buildStaticFile(filePath, path.resolve(targetDir, config.pageName + '.' + ext));
        return;
    }
}

const buildStaticFile = (sourceFilePath, targetFilePath) => {
    // copy it over
    fs.copyFileSync(sourceFilePath, targetFilePath);
}

module.exports = buildFile;