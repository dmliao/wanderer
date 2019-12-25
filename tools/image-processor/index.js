const fs = require('fs')
const path = require('upath')
const stream = require('stream')
const spawn = require('child_process').spawn
const sharp = require('sharp')

const processImage = (inputFilePath, targetFilePath, config) => {
    config = config || {}
    const inputFile = path.basename(inputFilePath)
    const ext = path.extname(inputFile)

    const sharpTransformer = sharp()
        .resize({
            width: 1200,
            height: 1200,
            fit: 'inside',
            withoutEnlargement: true
        })
        .jpeg({
            progressive: true,
            force: false
        })
        .png({
            progressive: true,
            compressionLevel: 9,
            adaptiveFiltering: true,
            force: false
        });

    const bufferStream = fs.createReadStream(inputFilePath)

    const exifProcessedStream = new stream.PassThrough()
    try {
        if (config.noStripMetadata) {
            throw new Error('skipping exiftool step')
        }
        const exifProcess = spawn('exiftool', ['-all=', '-', '-o', '-'])
        bufferStream.pipe(exifProcess.stdin)

        exifProcess.stdout.pipe(exifProcessedStream)
    } catch (e) {
        console.log(e)
        console.log('exiftool not found in path or was deliberately not used. You need to install exiftool yourself if you want to strip metadata from images')
        bufferStream.pipe(exifProcessedStream)
    }
    
    const outputStream = fs.createWriteStream(targetFilePath)
    switch (ext.toLowerCase().slice(1)) {
        case 'jpg':
            exifProcessedStream
                .pipe(sharpTransformer)
                .pipe(outputStream)
            break;
        case 'png':
            try {
                if (config.noPNGCompress) {
                    throw new Error('skipping pngquant step')
                }
                const pngQuant = spawn('pngquant', ['-v', '-f', '-s10', '-'])

                exifProcessedStream
                    .pipe(sharpTransformer)
                    .pipe(pngQuant.stdin)
                
                pngQuant.stdout.pipe(outputStream)
            } catch (e) {
                console.log(e)
                console.log('pngquant not found in path or was deliberately not used. You need to install pngquant yourself to compress PNGs')
        
                exifProcessedStream
                    .pipe(sharpTransformer)
                    .pipe(outputStream)
            }

            break;
        default:
            // pass through because we have no idea what's going on here
            exifProcessedStream.pipe(outputStream)
            break;
    }

    const imageTrackingString = 'write image ' + inputFile
    console.time(imageTrackingString)
    outputStream.on('finish', () => console.timeEnd(imageTrackingString))
}

module.exports = processImage