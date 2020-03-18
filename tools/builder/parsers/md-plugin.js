const buildMarkdownFile = (opts) => {

    const {
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
    } = opts;

    const parsedConfig = pageObject.config;
    const layoutText = genLayout();

    // figure out if we should add css / js files
    const pageStatics = genPageStatics();
    const feeds = genFeeds();

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
    genBuild(templatedHTML, '.html');

}

module.exports = buildMarkdownFile;