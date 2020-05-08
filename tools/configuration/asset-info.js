const fs = require('fs');
const path = require('upath');
const getConfiguration = require('./configuration')

const processTempoFilename = require('../tempo/process-tempo-filename')

const getAssetInfo = (baseDir, targetFile) => {
	const targetFilePath = path.resolve(targetFile);
	const stats = fs.statSync(targetFilePath);

	const id = path.relative(baseDir, targetFilePath);
	const pageTempo = processTempoFilename(path.parse(targetFilePath).name)

	let date;
	if (pageTempo.date) {
		date = pageTempo.date
	} else {
		date = stats.mtime
	}
	const updated = stats.mtime;
	const pageName = pageTempo.name;

	const config = getConfiguration(baseDir, targetFile);

	// get the URL
	const pathDir = config.dir || path.dirname(id)
	const pathEnd = config.rename || pageName

	let url = [
		pathDir === '.' ? '' : pathDir,
		pathEnd === 'index' ? '' : pathEnd
	].join('/')

	const assetInfo = {
		path: targetFilePath,
		id,
		date,
		updated,
		pageName,
		url,
		config
	}

	return assetInfo;
}

const getPageInfo = (baseDir, targetFile) => {
	const assetInfo = getAssetInfo(baseDir, targetFile);
	const assetText = fs.readFileSync(path.resolve(targetFile), 'utf-8');
	
	// get the title
	let title;
	if (assetInfo.config.title) {
		title = assetInfo.config.title
	} else if (assetText.trim().startsWith('# ')) {
		title = assetText
			.trim()
			.split(/\r\n|\r|\n/g)[0]
			.slice(2)
			.trim()
	} else {
		title = assetInfo.config.pageName
	}

	return {
		...assetInfo,
		text: assetText,
		title,
	}
}

module.exports = { 
	getAssetInfo,
	getPageInfo,
}