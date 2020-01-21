const tempo = require('./index')

const processFilename = (filename) => {
    let tempoString = undefined;
    let processedFilename = filename;
    let date = undefined;

    const possibleDateTokens = filename.split('-');
    const possibleDateString = possibleDateTokens.shift()
    if (tempo.isTempoString(possibleDateString)) {
        tempoString = possibleDateString;
        date = tempo.parse(tempoString)
        processedFilename = possibleDateTokens.join('-');
    } else if (/^[0-9]+$/g.test(possibleDateString) && possibleDateTokens.length > 0) {
        processedFilename = possibleDateTokens.join('-');
    }

    return { tempo: tempoString, date, name: processedFilename }
}

module.exports = processFilename;