const fs = require('fs')
const path = require('path');
const toml = require('toml');

const splitFilePath = require('./utils/split-filepath')
const processFilename = require('./utils/process-tempo-filename')

const buildMarkdownFile = require('./parsers/md')

const processImage = require('../image-processor/index')

const imageExtensions = ['png', 'jpg']
const metaExtensions = ['toml']
const processedEntryExtensions = ['md', 'htm']

const buildFile = (filePath, dirConfig, baseContentDir, baseFrameDir, baseBuildDir) => {
    const file = path.basename(filePath);
    
    const filePathDetails = splitFilePath(file);

    // ignore meta files
    if (metaExtensions.indexOf(filePathDetails.ext) >= 0) {
        return;
    }

    let config = {...dirConfig};

    // short circuit if private = true
    if (config.private && config.private === true) {
        return;
    }
    
    const defaultTargetPath = path.resolve(baseBuildDir, path.relative(baseContentDir, filePath));
    const defaultTargetDir = path.dirname(defaultTargetPath);

    let defaultProcessedFileObject = processFilename(filePathDetails.name);
    const tempoString = defaultProcessedFileObject.tempo;
    config.date = tempoString

    // Determine whether we should change file paths from config
    const targetDir = config.dir ? path.resolve(baseBuildDir, config.dir) : defaultTargetDir
    const processedFilename = defaultProcessedFileObject.name;
    
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true })
    }

    // image
    if (imageExtensions.indexOf(filePathDetails.ext.toLowerCase()) >= 0) {
        processImage(filePath, path.resolve(targetDir, processedFilename + '.' + filePathDetails.ext))
        return;
    }

    if (processedEntryExtensions.indexOf(filePathDetails.ext.toLowerCase()) < 0) {
        // it's static. We copy over the file without doing anything (though we do strip tempo dates if needed)
        buildStaticFile(filePath, path.resolve(targetDir, processedFilename + '.' + filePathDetails.ext));
        return;
    }

    // markdown
    if (filePathDetails.ext === 'md') {
        buildMarkdownFile(filePath, targetDir, processedFilename, baseFrameDir, config);
    }

    // htm

    // html
    if (filePathDetails.ext === 'html') {
        buildStaticFile(filePath, path.resolve(targetDir, processedFilename + '.' + filePathDetails.ext));
        return;
    }
}

const buildStaticFile = (sourceFilePath, targetFilePath) => {
    // copy it over
    fs.copyFileSync(sourceFilePath, targetFilePath);
}

module.exports = buildFile;