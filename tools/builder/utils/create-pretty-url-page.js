const path = require('upath')
const fs = require('fs')
const parser = require('himalaya')

const splitFilepath = require('./split-filepath')

const urlXPath = `//a/@href 
| //applet/@codebase 
| //area/@href 
| //base/@href 
| //blockquote/@cite 
| //body/@background 
| //del/@cite 
| //form/@action 
| //frame/@src 
| //frame/@longdesc 
| //head/@profile 
| //iframe/@longdesc 
| //iframe/@url 
| //img/@longdesc 
| //img/@usemap 
| //input/@src
| //input/@usemap 
| //ins/@cite 
| //object/@classid 
| //object/@codebase 
| //object/@data 
| //object/@usemap 
| //q/@cite 
| //img/@src
| //link/@href 
| //source/@src 
| //embed/@src
| //script/@src
| //audio/@src 
| //button/@formaction 
| //command/@icon 
| //html/@manifest 
| //input/@formaction 
| //video/@poster 
| //video/@src`

const parseUrlXPath = () => {
    const paths = urlXPath.split('|')
    let types = {}
    for (let p of paths) {
        const trimmedPath = p.trim();
        const keyValue = trimmedPath.split('/@')
        const elementType = keyValue[0].slice(2)
        const elementAttribute = keyValue[1]

        if (!types[elementType]) {
            types[elementType] = []
        }

        types[elementType].push(elementAttribute)
    }
    console.log(types)
    return types;
}

const recurse = (htmlAsJsonElement, urlPaths) => {
    if (htmlAsJsonElement.children && htmlAsJsonElement.children.length) {
        for (let child of htmlAsJsonElement.children) {
            recurse(child, urlPaths)
        }
    }

    if (htmlAsJsonElement.type !== 'element') {
        return;
    }

    if (!urlPaths[htmlAsJsonElement.tagName]) {
        return;
    }

    const possibleAttributes = urlPaths[htmlAsJsonElement.tagName];
    for (let attribute of htmlAsJsonElement.attributes) {
        if (possibleAttributes.indexOf(attribute.key) >= 0) {
            // we have a URL value!
            const url = attribute.value

            if (!url.startsWith('.')) {
                continue;
            }

            // if it's a relative URL, replace it with a URL that goes to a parent directory.
            const newUrl = path.join('..',url)
            
            // Time to modify the attribute to point to the new URL!
            attribute.value = newUrl;
        }
    }
}

const createHTMLWithParentedRelativeLinks = (htmlOfTarget) => {
    // analyze all links and replace all relative links with one level up.
    const htmlAsJson = parser.parse(htmlOfTarget);
    const urlPaths = parseUrlXPath();

    for (let htmlElement of htmlAsJson) {
        recurse(htmlElement, urlPaths)
    }

    const newHTML = parser.stringify(htmlAsJson);

    return newHTML;
}

const createPrettyUrlPage = (targetPath, htmlOfTarget) => {
    const targetDir = path.dirname(targetPath);
    const splitPath = splitFilepath(path.basename(targetPath))

    const newHTML = createHTMLWithParentedRelativeLinks(htmlOfTarget);

    const targetDirPretty = path.resolve(targetDir, splitPath.name)

    if (!fs.existsSync(targetDirPretty)) {
        fs.mkdirSync(targetDirPretty, { recursive: true });
    }

    fs.writeFileSync(path.resolve(targetDirPretty, 'index.html'), newHTML)
}

module.exports = createPrettyUrlPage;

// for testing purposes only, since we don't want to touch files while testing
module.exports.test = createHTMLWithParentedRelativeLinks;