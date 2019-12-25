
const splitFilePath = (file) => {
    const tokens = file.split('.');
    const ext = tokens.pop();
    return {
        name: tokens.join('.'),
        ext: ext.toLowerCase()
    }
}

module.exports = splitFilePath;