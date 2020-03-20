# Plugins

All file processing in wanderer is done via plugins. When parsing each file, wanderer takes the list of available plugins, and uses the first one that matches the input extension, and processes the file with that plugin. If nothing matches, wanderer copies over the file as-is.

## Using custom plugins

You can define custom plugins using the site-wide `config.toml` file, by listing them as an array under the `plugins` field.

```
plugins=["wanderer-jsx-to-html"]
```

The plugins are included via CommonJS `require()` relative to the directory you call wanderer from, so you can reference local files, or modules installed in `node_modules/`.

## Creating custom plugins

Plugins are defined as a class with the following interface:

```
class Plugin {
    getType() {
        return 'ASSET' // or 'CONTENT'
    }

    getExtensions() {
        return ['list', 'of', 'extensions', 'that', 'the', 'plugin', 'should', 'operate', 'on]
    }

    parse(opts) {
        // take in the source file, and output it to the build directory
    }
}
```

The `parse` function returns different options depending on whether the plugin processes **asset** or **content** files.

All `opts` objects have a `touchedFile` parameter, which is an object with relevant information about the input file. That `fileInfo` object has the following shape:

```
{
    isModified: boolean, - whether or not the file was modified since last build
    id: string, - unique identifier for the file
    file: string, - filename with extension of the source directory
    dir: string, - path to the source directory of the file
    config: object - the _directory_ configuration object. Includes dates.
}
```

**Asset** files are things like images, sound, etc. They don't count as individual web pages, so don't get folded into the next / previous pages, or into feeds. The `opts` object of an asset plugin looks like:

```
{
    touchedFile, - fileInfo - object with information about the input file
    baseFrameDir, - string - path to the frame directory
    targetDirPath, - string - path to the directory that this file should be saved in
    cacheDirectory - string - path to the cache directory for storing temporary files
}
```

**Content** files are files that should be processed into pages. As a result, the `opts` object here contains some more helper functions, including ones to generate feeds and create pretty URLs. The `opts` object looks like this:

```
{
    {
		// base inputs
		touchedFile, - fileInfo
		baseFrameDir, - string
		targetDirPath, - string
		pageObject, - object - contains information for the content page such as the next / previous pages, as well as canonical URLs.

		// generator functions
		genPageStatics,
		genBuild,
		genFeeds,
		genLayout,

		// helper libraries
		harpe, - markdown parser
		template - templating engine
	}
}
```

A **pageObject** has the following shape:

```
{
    date - Date object with the last modified (or custom set) date
    title, - title of the page
    text, - raw text of the page
    config, - configuration, along with extra parts
    sourceDir, - path of the source directory
    url, - expected URL of the page
    tags, - list of tags associated with the page
}
```

**genPageStatics()** - creates a file that contains static files associated with the page.
static files are files that have the same name as a content file. Returns an object:

```
{
    css: path to css file
	js: path to js file
    statics: [list of other static files]
}
```

**genBuild(content, extension)** - writes the content to the canonical URL of the page with the provided file extension (generally `.html`). This will allow you to make pages that have pretty URLs. Has no return.

**genFeeds()** - generates a feed object for the page based on the values provided in the configuration, which can then be passed to the template. Returns a list:

```
[
    ...pageObject
]
```

**genLayout()** - produces layout text from the configuration that can then be fed into `template` to create an HTML output.


## Example

This is the default plugin used for parsing Markdown files.

```
const Plugin = require('../plugin-template');
class MDParser extends Plugin {
    getType() {
        // should return 'ASSET' or 'CONTENT'
        return this.types.CONTENT;
    }

    getExtensions() {
        return ['md'];
    }

    parse(opts) {
            
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
}

module.exports = MDParser;
```