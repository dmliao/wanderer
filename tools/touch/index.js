const touch = require('./touch')
const path = require('path')
const fs = require('fs')

const touchBin = async (dir, touchFile) => {
    const dateFile = touchFile || undefined;
    if (!dateFile) {
        return touch(dir, new Date(0));
    }
    if (!fs.existsSync(dateFile)) {
        fs.writeFileSync(dateFile, new Date().toISOString())
        return touch(dir, new Date(0));
    }

    const dateFileText = fs.readFileSync(dateFile);
    const date = Date.parse(dateFileText);
    fs.writeFileSync(dateFile, new Date().toISOString())
    return await touch(dir, date);

}

module.exports = touchBin