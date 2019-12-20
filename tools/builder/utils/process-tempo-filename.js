const tempo = require('../../tempo/index')

const processFilename = (filename) => {
    let tempoString = undefined;
    let processedFilename = filename;

    const possibleDateTokens = filename.split('-');
    if (tempo.isTempoString(possibleDateTokens[0])) {
        tempoString = possibleDateTokens.shift();
        processedFilename = possibleDateTokens.join('-');
    } 

    return { tempo: tempoString, name: processedFilename }
}

module.exports = processFilename;