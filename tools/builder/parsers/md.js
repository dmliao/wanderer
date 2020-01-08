const fs = require('fs')
const path = require('path')
const harpe = require('../../harpe/harpe')
const template = require('../../template/index')

const parseFrontmatter = require('../../frontmatter/index')
const findStatics = require('../utils/find-statics')
const createPrettyUrlPage = require('../utils/create-pretty-url-page')

const buildMarkdownFile = (sourceFilePath, targetDirPath, processedFilename, baseFrameDir, dirConfig) => {
    const sourceText = fs.readFileSync(sourceFilePath, 'utf-8');

    // check for frontmatter
    const parsedText = parseFrontmatter(sourceText);

    const parsedConfig = { ...dirConfig, ...parsedText.config };

    // handle file-level configuration
    if (parsedConfig.private && parsedConfig.private === true) {
        // skip this, since it's a private file
        return;
    }

    processedFilename = parsedConfig.rename || processedFilename;

    // find the layout
    const layout = parsedConfig.layout || 'default';

    // end handle file-level configuration

    const layoutPath = path.resolve(baseFrameDir, 'layouts', layout + '.html');
    let layoutText = '${o.content}'
    if (fs.existsSync(layoutPath)) {
        layoutText = fs.readFileSync(path.resolve(baseFrameDir, 'layouts', layout + '.html')).toString();
    }

    // figure out if we should add css / js files
    const pageStatics = findStatics(sourceFilePath)

    // parse and generate the template
    const parser = harpe();
    const html = parser.parse(parsedText.text);
    const parsedHTML = template(html, parsedConfig)
    const templatedHTML = template(layoutText,
        {
            // adds page-specific css and js
            ...pageStatics,

            // adds anything from the frontmatter + folder config
            ...parsedConfig,

            content: parsedHTML,
            _baseDir: baseFrameDir
        })

    const targetPath = path.resolve(targetDirPath, processedFilename + '.html')

    // we really don't need to create a pretty URL page for an index
    if (processedFilename !== 'index') {
        createPrettyUrlPage(targetPath, templatedHTML);
    } else {
        // write the file
        fs.writeFileSync(targetPath, templatedHTML);
    }

}

module.exports = buildMarkdownFile;