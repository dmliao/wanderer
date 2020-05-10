const fs = require('fs')
const path = require('upath')
const toml = require('@iarna/toml')

const genSiteInfo = (
	globalConfigFilePath,
	contentDirPath,
	frameDirPath,
	cacheDirPath,
	buildDirPath
) => {
	let config = {}
	if (fs.existsSync(globalConfigFilePath)) {
		config = toml.parse(fs.readFileSync(globalConfigFilePath))
	}

	// site info object
	return {
		config,
		contentDir: path.resolve(contentDirPath),
		frameDir: path.resolve(frameDirPath),
		staticDir: path.resolve(frameDirPath, 'static'),
		cacheDir: path.resolve(cacheDirPath),
		buildDir: path.resolve(buildDirPath),
	}
}

module.exports = genSiteInfo
