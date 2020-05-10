const fs = require('fs')
const path = require('upath')
const dayjs = require('dayjs')

const createTouchedFileObject = (isModified, dir, file) => {
	return {
		isModified,
		path: path.resolve(dir, file),
	}
}

const touchRecursive = async (baseDir, dir, dateToCheck) => {
	let files = fs.readdirSync(dir)
	files = await Promise.all(
		files.map(async (file) => {
			const filePath = path.join(dir, file)
			const stats = fs.statSync(filePath)
			if (stats.isDirectory()) return touchRecursive(baseDir, filePath, dateToCheck)
			else if (stats.isFile()) {
				if (dayjs(dateToCheck).isBefore(dayjs(stats.mtime))) {
					// this was touched!

					return createTouchedFileObject(true, dir, file)
				}

				return createTouchedFileObject(false, dir, file)
			}
		})
	)

	return files
}

const touch = async (dir, dateToCheck) => {
	const files = await touchRecursive(dir, dir, dateToCheck)
	const flats = files.flat(Infinity)
	const processedFiles = []
	for (let file of flats) {
		if (file) {
			processedFiles.push(file)
		}
	}

	return processedFiles
}

module.exports = touch
