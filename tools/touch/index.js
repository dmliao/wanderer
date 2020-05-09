const touch = require('./touch')
const path = require('upath')
const fs = require('fs')

const touchBin = async (dir, touchFile, shouldUpdateTouchFile) => {
	const dateFile = touchFile || undefined
	if (!dateFile) {
		return touch(dir, new Date(0))
	}
	if (!fs.existsSync(dateFile)) {
		if (!fs.existsSync(path.dirname(dateFile))) {
			fs.mkdirSync(path.dirname(dateFile), { recursive: true })
		}
		if (shouldUpdateTouchFile) {
			fs.writeFileSync(dateFile, new Date().toISOString())
		}
		return touch(dir, new Date(0))
	}

	const dateFileText = fs.readFileSync(dateFile)
	const date = Date.parse(dateFileText)
	if (shouldUpdateTouchFile) {
		if (!fs.existsSync(path.dirname(dateFile))) {
			fs.mkdirSync(path.dirname(dateFile), { recursive: true })
		}
		fs.writeFileSync(dateFile, new Date().toISOString())
	}
	return await touch(dir, date)
}

module.exports = touchBin
