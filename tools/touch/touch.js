const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const toml = require('toml');

const touch = async (dir, globalConfig, dateToCheck) => {
    let fileConfig = globalConfig || {}
    let files = fs.readdirSync(dir);
    files = await Promise.all(files.map(async file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        // find the directory-level config
        const configFilePath = path.resolve(dir, '_.toml')
        if (fs.existsSync(configFilePath)) {
            const dirConfig = toml.parse(fs.readFileSync(configFilePath).toString())
            fileConfig = { ...globalConfig, ...dirConfig }
        }

        if (stats.isDirectory()) return touch(filePath, fileConfig, dateToCheck);
        else if(stats.isFile()) {
            if (dayjs(dateToCheck).isBefore(dayjs(stats.mtime))) {
                // this was touched!

                // TODO: also add the config to this.
                return { file: file, dir: dir, config: fileConfig }
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