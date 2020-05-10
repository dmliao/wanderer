const fs = require('fs')
const path = require('upath')

const Plugin = require('../plugin-template')

// simply copies the source file to target directory.
// this parser is used if no extensions match.
class CopyParser extends Plugin {
	getType() {
		return this.types.ASSET
	}

	getExtensions() {
		return []
	}

	parse(opts) {
		const {
			// base inputs
			siteInfo,
			fileInfo,
			targetDirPath,
			cacheDirectory,
		} = opts

		const ext = path.parse(fileInfo.path).ext.slice(1)
		const targetFilePath = path.resolve(targetDirPath, fileInfo.pageName + '.' + ext)
		const sourceFilePath = path.resolve(fileInfo.path)
		fs.copyFileSync(sourceFilePath, targetFilePath)
	}
}

module.exports = CopyParser
