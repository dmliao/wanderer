const touch = require('./touch')
const path = require('upath')
const fs = require('fs')

const touchBin = async (dir, config, touchFile, shouldUpdateTouchFile) => {
    const dateFile = touchFile || undefined;
    if (!dateFile) {
        return touch(dir, config, new Date(0));
    }
    if (!fs.existsSync(dateFile)) {
        if (shouldUpdateTouchFile) {
            fs.writeFileSync(dateFile, new Date().toISOString())
        }
        return touch(dir, config, new Date(0));
    }

    const dateFileText = fs.readFileSync(dateFile);
    const date = Date.parse(dateFileText);
    if (shouldUpdateTouchFile) {
        fs.writeFileSync(dateFile, new Date().toISOString())
    }
    return await touch(dir, config, date);

}

module.exports = touchBin