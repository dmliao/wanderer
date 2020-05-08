const fs = require('fs');
const path = require('upath');
const getConfiguration = require('./configuration')

const processTempoFilename = require('../tempo/process-tempo-filename')

// an asset can be any file
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

	if (!url.startsWith('/')) {
		url = '/' + url
	}

	const dir = path.dirname(targetFilePath);
	const file = path.basename(targetFilePath);

	const assetInfo = {
		path: targetFilePath,
		id,
		dir, 
		file,
		date,
		updated,
		pageName,
		url,
		config
	}

	return assetInfo;
}

// a page specifically is a content file, so adds 
// additional helpers like a title and the body text
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
		title = assetInfo.pageName
	}

	return {
		...assetInfo,
		text: assetText,
		title,
	}
}

// previous and next pages are determined by their alphabetical order in a directory.
// note that you can number pages to ensure that they order properly
// the predicate takes an assetInfo as input, and returns true if it's a valid page
// this is a way to skip files that aren't pages, or index files.
// example: 01-title.md
const getPreviousPage = (baseDir, targetFile, predicate) => {
	const assetInfo = getAssetInfo(baseDir, targetFile);

	const possiblePages = fs.readdirSync(assetInfo.dir);
	const startIndex = possiblePages.indexOf(assetInfo.file);

	for (let i = startIndex - 1; i >= 0; i--) {
		const possibleFilename = possiblePages[i];
		const possibleFilePath = path.resolve(assetInfo.dir, possibleFilename);
		const newAssetInfo = getAssetInfo(baseDir, possibleFilePath);
		if (predicate(newAssetInfo)) {
			const newPageInfo = getPageInfo(baseDir, possibleFilePath);
			return {
				id: newPageInfo.id,
				title: newPageInfo.title,
				url: newPageInfo.url,
			}
		}
	}

	return undefined;
}

const getNextPage = (baseDir, targetFile, predicate) => {
	const assetInfo = getAssetInfo(baseDir, targetFile);

	const possiblePages = fs.readdirSync(assetInfo.dir);
	const startIndex = possiblePages.indexOf(assetInfo.file);

	for (let i = startIndex + 1; i < possiblePages.length; i++) {
		const possibleFilename = possiblePages[i];
		const possibleFilePath = path.resolve(assetInfo.dir, possibleFilename);
		const newAssetInfo = getAssetInfo(baseDir, possibleFilePath);
		if (predicate(newAssetInfo)) {
			const newPageInfo = getPageInfo(baseDir, possibleFilePath);
			return {
				id: newPageInfo.id,
				title: newPageInfo.title,
				url: newPageInfo.url,
			}
		}
	}

	return undefined;
}

module.exports = { 
	getAssetInfo,
	getPageInfo,
	getPreviousPage,
	getNextPage,
}