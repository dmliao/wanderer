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

const buildFile = (filePath, globalConfig, baseContentDir, baseFrameDir, baseBuildDir) => {
    const dir = path.dirname(filePath);
    const file = path.basename(filePath);
    
    const filePathDetails = splitFilePath(file);

    // ignore meta files
    if (metaExtensions.indexOf(filePathDetails.ext) >= 0) {
        return;
    }

    let config = {...globalConfig};
    
    // get the folder-wide meta
    if (fs.existsSync(path.resolve(dir, '_.toml'))) {
        const tomlPathMeta = toml.parse(fs.readFileSync(path.resolve(dir, '_.toml'), 'utf-8'));
        config = { ...config, ...tomlPathMeta }
    }

    const targetPath = path.resolve(baseBuildDir, path.relative(baseContentDir, filePath));
    const targetDir = path.dirname(targetPath);

    // TODO: modify targetDir here if we want to obfuscate it for whatever reason.
    // e.g. if we have a folder-wide config 
    
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true })
    }

    let p = processFilename(filePathDetails.name);
    const tempoString = p.tempo;
    const processedFilename = p.name;

    // image
    if (imageExtensions.indexOf(filePathDetails.ext.toLowerCase()) >= 0) {
        // TODO: do some extra image processing.
        processImage(filePath, path.resolve(targetDir, processedFilename + '.' + filePathDetails.ext))
        // buildStaticFile(filePath, path.resolve(targetDir, processedFilename + '.' + filePathDetails.ext));
        return;
    }

    if (processedEntryExtensions.indexOf(filePathDetails.ext.toLowerCase()) < 0) {
        // it's static. We copy over the file without doing anything (though we do strip tempo dates if needed)
        buildStaticFile(filePath, path.resolve(targetDir, processedFilename + '.' + filePathDetails.ext));
        return;
    }

    // markdown
    if (filePathDetails.ext === 'md') {
        buildMarkdownFile(filePath, targetDir, p, baseFrameDir, config);
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