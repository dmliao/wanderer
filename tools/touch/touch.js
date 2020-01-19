const fs = require('fs');
const path = require('upath');
const dayjs = require('dayjs');
const toml = require('toml');

const processTempoFilename = require('../tempo/process-tempo-filename')


const createTouchedFileObject = (isTouched, baseDir, dir, file, stats, fileConfig) => {
    // do first pass of processing since touch is the only time we traverse the directory
    // and touch all the files
    const id = path.relative(baseDir, path.resolve(dir, file))
    const pageTempo = processTempoFilename(path.parse(file).name)

    const newConfig = { ...fileConfig }

    if (pageTempo.date) {
        newConfig.date = pageTempo.date
    } else {
        newConfig.date = stats.mtime
    }

    newConfig.updated = stats.mtime
    newConfig.pageName = pageTempo.name
    return {
        isModified: isTouched,
        id,
        file,
        dir: path.resolve(dir),
        config: newConfig,
    }
}

const touchRecursive = async (baseDir, dir, globalConfig, dateToCheck) => {
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

        if (fileConfig.private && fileConfig.private === true) {
            return;
        }

        if (stats.isDirectory()) return touchRecursive(baseDir, filePath, fileConfig, dateToCheck);
        else if (stats.isFile()) {
            if (dayjs(dateToCheck).isBefore(dayjs(stats.mtime))) {
                // this was touched!

                return createTouchedFileObject(true, baseDir, dir, file, stats, fileConfig)
            }

            return createTouchedFileObject(false, baseDir, dir, file, stats, fileConfig);
        }
    }));

    return files
}

const touch = async (dir, globalConfig, dateToCheck) => {

    const files = await touchRecursive(dir, dir, globalConfig, dateToCheck)
    const flats = files.flat(Infinity);
    const processedFiles = [];
    for (let file of flats) {
        if (file) {
            processedFiles.push(file)
        }
    }

    return processedFiles;
}


module.exports = touch;