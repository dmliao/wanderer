const touch = require('../../tools/touch/touch')
const path = require('upath')

const touchWithoutConfig = async (baseDir) => {
	const touchedFiles = await touch(baseDir, new Date(0))
	let files = []
	for (let file of touchedFiles) {
		if (path.extname(file.path).toLowerCase() === '.toml') {
			continue
		}
		files.push(file)
	}

	return files
}

const genTouchStaticFiles = async (siteInfo) => {
	return await touchWithoutConfig(siteInfo.staticDir, new Date(0))
}

const genTouchContentFiles = async (siteInfo) => {
	return await touchWithoutConfig(siteInfo.contentDir, new Date(0))
}

module.exports = {
	genTouchContentFiles,
	genTouchStaticFiles,
}
