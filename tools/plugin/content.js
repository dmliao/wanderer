const fs = require('fs')
const path = require('upath')
const harpe = require('../harpe/harpe')
const template = require('../template/index')

const findStatics = require('../builder/utils/find-statics')
const createPrettyUrlPage = require('../builder/utils/create-pretty-url-page')

const globals = require('../common/globals')

const plugin = (pluginFunction, touchedFile, targetDirPath, baseFrameDir, cache) => {
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

    const genPageStatics = () => {
        const sourceFilePath = path.resolve(touchedFile.dir, touchedFile.file)
    
        // figure out if we should add css / js files
        const pageStatics = findStatics(sourceFilePath)
        return pageStatics;
    }

    const genFeeds = () => {
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

        return feeds;
    }

    const genLayout = () => {
        // find the layout
        const layout = parsedConfig.layout || 'default';

        const layoutPath = path.resolve(baseFrameDir, 'layouts', layout + '.html');
        let layoutText = '${o.content}'
        if (fs.existsSync(layoutPath)) {
            layoutText = fs.readFileSync(path.resolve(baseFrameDir, 'layouts', layout + '.html')).toString();
        }

        return layoutText;
    }

    const genBuild = (content, extension) => {
        const targetPath = path.resolve(targetDirPath, processedFilename + extension)
        // we really don't need to create a pretty URL page for an index
        if (globals.specialFilenames.indexOf(processedFilename) <= -1) {
            createPrettyUrlPage(targetPath, content);
        } else {
            // write the file
            fs.writeFileSync(targetPath, content);
        }

    }

    // call the pluginFunction
    pluginFunction({
        // base inputs
        touchedFile,
        baseFrameDir,
        targetDirPath,
        pageObject,

        // generator functions
        genPageStatics,
        genBuild,
        genFeeds,
        genLayout,

        // helper libraries
        harpe,
        template
    });
}

module.exports = plugin;