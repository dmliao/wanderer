const fs = require('fs');
const path = require('upath');
const frontmatter = require('../frontmatter/index')
const toml = require('@iarna/toml')

const getSingleDirConfig = (dir, configFilename) => {
	configFilename = configFilename || '_.toml';
	if (!fs.existsSync(path.resolve(dir, configFilename))) {
		return {};
	}

	return toml.parse(fs.readFileSync(path.resolve(dir, configFilename), 'utf-8'));
}

const defaultCacheObject = {};

// retrieve the configuration of a particular file or folder, given the base dir (either frame or content)
// optionally pass in a cache by reference, which will eventually fill with configs
// to avoid re-fetching them
const getConfiguration = (baseDir, targetFileOrDir, cacheObj) => {
	cacheObj = cacheObj || defaultCacheObject;
	const filepath = path.resolve(targetFileOrDir);

	if (cacheObj && cacheObj[filepath]) {
		return cacheObj[filepath];
	}
	
	let dirConfig = {};
	const relativePath = path.relative(path.resolve(baseDir), filepath);
	const dirsToGetConfigFrom = relativePath.split('/');
	dirsToGetConfigFrom.pop();
	dirsToGetConfigFrom.unshift('.');

	let currentDirToExamine = baseDir;
	for (const dir of dirsToGetConfigFrom) {
		currentDirToExamine = path.resolve(currentDirToExamine, dir);
		if (cacheObj && cacheObj[currentDirToExamine]) {
			dirConfig = {...cacheObj[currentDirToExamine]};
		} else {
			dirConfig = {...dirConfig, ...getSingleDirConfig(currentDirToExamine)}
		}
		
		// add the dir to the cache
		if (cacheObj) {
			cacheObj[currentDirToExamine] = {...dirConfig};
		}
		
	};

	// get the file's configuration
	if (fs.existsSync(filepath) && !fs.lstatSync(filepath).isDirectory()) {
		const fileConfig = frontmatter(fs.readFileSync(filepath, 'utf-8')).config;
		const totalConfig = {...dirConfig, ...fileConfig};

		if (cacheObj) {
			cacheObj[filepath] = totalConfig;
		}

		return totalConfig;
	}

	return dirConfig;
}

module.exports = getConfiguration;