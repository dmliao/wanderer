const fs = require('fs')
const path = require('path');

const tempo = require('../tempo/index')
const processFilename = require('./utils/process-tempo-filename')

const buildMarkdownFile = require('./parsers/md')

const processImage = require('../image-processor/index')

const imageExtensions = ['png', 'jpg']
const metaExtensions = ['toml']
const processedEntryExtensions = ['md', 'htm']

// cache is optional. If a cache is not provided, we'll create a temporary one
const buildFile = (touchedFile, baseContentDir, baseFrameDir, baseBuildDir, cache) => {
    const filePath = path.resolve(touchedFile.dir, touchedFile.file)

    const filename = path.parse(touchedFile.file).name
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

    // TODO: all editing of config should definitely be happening earlier.
    // This should probably actually go into touch, since every single file should have this processing happen
    // at some point
    // START EXTREMELY SPOONY CODE
    
    let defaultProcessedFileObject = processFilename(filename);
    const tempoString = defaultProcessedFileObject.tempo;
    const fileDate = tempoString ? tempo.parse(tempoString) : new Date();

    config.date = fileDate.toDateString();

    // Determine whether we should change file paths from config
    const targetDir = config.dir ? path.resolve(baseBuildDir, config.dir) : defaultTargetDir
    const processedFilename = defaultProcessedFileObject.name;

    // pass this into config
    config.pageName = processedFilename;

    // TODO: remove this when we don't need to update cache anymore
    const page = cache.getPage(touchedFile.id)
    const mergedConfig = { ...page.config, ...config }
    cache.global().merge({ config: mergedConfig, id: touchedFile.id }, "id")

    // END EXTREMELY SPOONY CODE
    
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true })
    }

    // image
    if (imageExtensions.indexOf(ext.toLowerCase()) >= 0) {
        processImage(filePath, path.resolve(targetDir, processedFilename + '.' + ext))
        return;
    }

    if (processedEntryExtensions.indexOf(ext.toLowerCase()) < 0) {
        // it's static. We copy over the file without doing anything (though we do strip tempo dates if needed)
        buildStaticFile(filePath, path.resolve(targetDir, processedFilename + '.' + ext));
        return;
    }

    // markdown
    if (ext === 'md') {
        buildMarkdownFile(touchedFile, targetDir, baseFrameDir, cache);
    }

    // htm

    // html
    if (ext === 'html') {
        buildStaticFile(filePath, path.resolve(targetDir, processedFilename + '.' + ext));
        return;
    }
}

const buildStaticFile = (sourceFilePath, targetFilePath) => {
    // copy it over
    fs.copyFileSync(sourceFilePath, targetFilePath);
}

module.exports = buildFile;