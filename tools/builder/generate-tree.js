const fs = require('fs');
const toml = require('toml');

const walk = require('./utils/walk');
const tempo = require('../tempo');

const entryPoints = ['md', 'htm', 'html']

const generateTree = async ( contentFolder ) => {
    
    const fullWalk = await walk(contentFolder);
    const tree = {};

    for (const file of fullWalk) {

        if (!tree[file.dir]) {
            tree[file.dir] = {};
        }

        let dir = tree[file.dir];

        let tempoString;
        let processedFilename;

        // process actual filename vs date
        const possibleDateTokens = file.name.split('-');
        if (tempo.isTempoString(possibleDateTokens[0])) {
            tempoString = possibleDateTokens.shift();
            processedFilename = possibleDateTokens.join('-');
        } else {
            processedFilename = file.name;
        }

        if (!dir[processedFilename]) {
            dir[processedFilename] = {}
        }
        
        let fileInfo = dir[processedFilename];

        // check if it's a meta file
        let isMeta = false;
        switch (file.ext) {
            case 'toml':
                const tomlContent = fs.readFileSync(file.file, 'utf-8');
                fileInfo.meta = toml.parse(tomlContent);
                isMeta = true;
            break;
        }

        if (isMeta) {
            continue;
        }

        // check if it's an entry point
        if (entryPoints.indexOf(file.ext) >= 0) {
            if (fileInfo.entryPoint) {
                console.warn('We have multiple entry points for this file. Is this expected?')
            }

            fileInfo.entryPoint = file;
            if (tempoString) {
                fileInfo.date = tempo.parse(tempoString);
            } else {
                fileInfo.date = file.lastUpdated;
            }
            continue;
        }
        
        // it's a static.
        if (!fileInfo.statics) {
            fileInfo.statics = {}
        }

        if (!fileInfo.statics[file.ext]) {
            fileInfo.statics[file.ext] = []
        }

        fileInfo.statics[file.ext].push(file);
        continue;

    }

    return tree;
}

module.exports = generateTree;