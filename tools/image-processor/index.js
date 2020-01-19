const fs = require('fs')
const path = require('upath')
const spawn = require('child_process').spawn

const processImageGM = (inputFilePath, targetFilePath, config, callback) => {
    config = config || {}
    const targetFileDir = path.dirname(targetFilePath)
    const ext = path.extname(inputFilePath).toLowerCase()

    if (!fs.existsSync(targetFileDir)) {
        fs.mkdirSync(targetFileDir, {recursive: true})
    }
    try {
        const gm = spawn('gm', ['convert', '-size', '1200x1200>', inputFilePath, '-resize', '1200x1200>', '-quality', 75, '-strip', targetFilePath])
        gm.on('close', () => {
            if (ext !== '.png') {
                if (callback) {
                    callback()
                }
                return;
            }
            try {
                if (config.noPNGCompress) {
                    throw new Error('skipping pngquant step')
                }
                const pngQuant = spawn('pngquant', ['--ext', '.png', '-f', '-s10', targetFilePath])
                pngQuant.on('close', () => {
                    if (callback) {
                        callback()
                    }
                })
            } catch (e) {
                console.log(e)
                console.log('pngquant not found in path or was deliberately not used. You need to install pngquant yourself to compress PNGs')
                if (callback) {
                    callback()
                }
            }
            
        })
    } catch (e) {
        console.log('Graphicsmagick (as gm) needs to be installed and on the path for image processing to work')
        throw e;
       
    }
    
}

const processImagePromise = (inputFilePath, targetFilePath, config) => {
    const inputFile = path.basename(inputFilePath)
    const imageTrackingString = 'write image ' + inputFile
    console.time(imageTrackingString)
    return new Promise((resolve, reject) => {
        try {
            processImageGM(inputFilePath, targetFilePath, config, () => {
                console.timeEnd(imageTrackingString)
                resolve();
            })
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = processImagePromise