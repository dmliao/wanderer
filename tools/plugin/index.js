const path = require('upath');

const contentPlugin = require('./content');
const assetPlugin = require('./asset');

const ImageParser = require('./parsers/image');
const MDParser = require('./parsers/md');
const CopyParser = require('./parsers/copy');

const runPlugin = (pluginInstance, touchedFile, targetDirPath, baseFrameDir, cache) => {
    const type = pluginInstance.getType();
    if (type === 'CONTENT') {
        return contentPlugin(pluginInstance.parse, touchedFile, targetDirPath, baseFrameDir, cache);
    }

    return assetPlugin(pluginInstance.parse, touchedFile, targetDirPath, baseFrameDir, cache);
}

const copyPlugin = new CopyParser();

const parseFile = (pluginList, touchedFile, targetDirPath, baseFrameDir, cache) => {
    if (!pluginList || !pluginList.length) {
        pluginList = [
            new ImageParser(),
            new MDParser(),
        ];
    }

    const ext = path.parse(touchedFile.file).ext.slice(1);
    let handled = false;
    for (let plugin of pluginList) {
        const validExtensions = plugin.getExtensions();
        if (validExtensions.indexOf(ext.toLowerCase()) >= 0) {
            runPlugin(plugin, touchedFile, targetDirPath, baseFrameDir, cache);
            handled = true;
            break;
        }
    }

    if (!handled) {
        // copy file over statically
        runPlugin(copyPlugin, touchedFile, targetDirPath, baseFrameDir, cache);
    }
}

module.exports = parseFile;