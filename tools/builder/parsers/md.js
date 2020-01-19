const fs = require('fs')
const path = require('upath')
const harpe = require('../../harpe/harpe')
const template = require('../../template/index')

const findStatics = require('../utils/find-statics')
const createPrettyUrlPage = require('../utils/create-pretty-url-page')

const buildMarkdownFile = (touchedFile, targetDirPath, baseFrameDir, cache) => {

    const sourceFilePath = path.resolve(touchedFile.dir, touchedFile.file)
    let pageObject = cache.getPage(touchedFile.id)

    if (!pageObject) {
        cache.update([touchedFile])
        pageObject = cache.getPage(touchedFile.id)
    }

    if (!pageObject) {
        // we assume at this point that the page is deliberately being uncached, and thus should
        // short-circuit here

        return;
    }
    
    const parsedConfig = pageObject.config;

    // handle file-level configuration
    ///////////////////////////////////

    if (parsedConfig.private && parsedConfig.private === true) {
        // skip this, since it's a private file
        return;
    }

    processedFilename = parsedConfig.rename || parsedConfig.pageName;

    // generate all of the feeds
    //////////////////////////////
    const feeds = {}
    if (parsedConfig.feeds) {
        for (let feedName of Object.keys(parsedConfig.feeds)) {
            const feed = parsedConfig.feeds[feedName]
            // if the feed query is a string, we need to generate a query from it
            const rawQuery = feed.query
            let query

            if (typeof rawQuery === 'string') {
                const relativeDir = path.join(pageObject.sourceDir, rawQuery)
                query = { sourceDir: relativeDir }
            } else {
                query = rawQuery
            }

            feeds[feedName] = cache.getFeed({ 
                query, 
                sortBy: feed.sortBy,
                isAscending: feed.isAscending,
                limit: feed.limit
            })
        }
    }

    // end feed generation
    //////////////////////

    // find the layout
    const layout = parsedConfig.layout || 'default';

    // end handle file-level configuration
    ////////////////////////////////////////

    const layoutPath = path.resolve(baseFrameDir, 'layouts', layout + '.html');
    let layoutText = '${o.content}'
    if (fs.existsSync(layoutPath)) {
        layoutText = fs.readFileSync(path.resolve(baseFrameDir, 'layouts', layout + '.html')).toString();
    }

    // figure out if we should add css / js files
    const pageStatics = findStatics(sourceFilePath)

    // parse and generate the template
    ////////////////////////////////////

    const parser = harpe();
    const html = parser.parse(pageObject.text)

    const templateVars = {
        // adds page-specific css and js
        ...pageStatics,

        // adds anything from the frontmatter + folder config
        ...parsedConfig,
        feeds,
        content: html,
        _baseDir: baseFrameDir
    }

    // second html pass: add layouts and additional partials to the content
    const templatedHTML = template(layoutText, templateVars)

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