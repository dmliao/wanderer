const fs = require('fs');
const path = require('path');

const processFilename = require('./process-tempo-filename')

// given a filepath, return all of the other files in the same folder with the same 'basename'
// CSS and JS files that have the same name as the source HTML / Markdown file get automatically included
// in the file's links / scripts.

const findStatics = (filePath) => {
    const dir = path.dirname(filePath);
    const filename = path.basename(filePath);

    let processedName = processFilename(path.parse(filename).name).name;
    const statics = {}

    const dirFiles = fs.readdirSync(dir);

    for (let f of dirFiles) {
        if (f === filename) {
            continue;
        }

        let fProcessedName = processFilename(path.parse(f).name).name;
        let ext = path.extname(filePath).slice(1)

        const staticPath = './' + filename;

        if (fProcessedName === processedName) {
            switch (ext) {
                case 'css':
                    statics.css = staticPath
                break;
                case 'js':
                    statics.js = staticPath
                break;
                default:
                    if (!statics.statics) {
                        statics.statics = []
                    }
                    statics.statics.push(staticPath)
            }
        }
    }

    return statics;
}

module.exports = findStatics;