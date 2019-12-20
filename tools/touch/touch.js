const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');

const touch = async (dir, dateToCheck) => {
    let files = fs.readdirSync(dir);
    files = await Promise.all(files.map(async file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) return touch(filePath, dateToCheck);
        else if(stats.isFile()) {
            if (dayjs(dateToCheck).isBefore(dayjs(stats.mtime))) {
                // this was touched!
                return { file: file, dir: dir }
            }

            return undefined;
        } 
    }));

    const flats = files.reduce((all, folderContents) => all.concat(folderContents), []);
    const processedFiles = [];
    for (let file of flats) {
        if (file) {
            processedFiles.push(file)
        }
    }

    return processedFiles;
}


module.exports = touch;