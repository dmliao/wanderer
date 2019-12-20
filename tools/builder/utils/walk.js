const fs = require('fs').promises;
const path = require('path');

const splitFilePath = require('./split-filepath')

async function walk(dir, callback) {
    let files = await fs.readdir(dir);
    files = await Promise.all(files.map(async file => {
        const filePath = path.join(dir, file);
        const stats = await fs.stat(filePath);
        if (stats.isDirectory()) return walk(filePath, callback);
        else if(stats.isFile()) {
            if (callback) {
                callback(filePath, dir);
            }
            const filePathDetails = splitFilePath(file);
            return { file: filePath, dir: dir, lastUpdated: stats.mtime, ...filePathDetails };
        } 
    }));

    return files.reduce((all, folderContents) => all.concat(folderContents), []);
}

module.exports = walk;