const fs = require('fs');
const path = require('upath');
const getConfiguration = require('./configuration')
const frontmatter = require('../frontmatter/index')

const processTempoFilename = require('../tempo/process-tempo-filename')

// an asset can be any file
const getAssetInfo = async (baseDir, targetFile, globalConfig) => {
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

	const config = await getConfiguration(baseDir, targetFile, globalConfig);

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
		dir, // TODO: deprecate, we have the whole path now
		file, // TODO: deprecate, we have the whole path now
		sourceDir: path.dirname(id), // TODO: find a better name for this...
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
const getPageInfo = async (baseDir, targetFile, globalConfig) => {
	const assetInfo = await getAssetInfo(baseDir, targetFile, globalConfig);
	const pageText = frontmatter.getTextAfterFrontmatter(targetFile);
	
	// get the title
	let title;
	if (assetInfo.config.title) {
		title = assetInfo.config.title
	} else if (pageText.trim().startsWith('# ')) {
		title = pageText
			.trim()
			.split(/\r\n|\r|\n/g)[0]
			.slice(2)
			.trim()
	} else {
		title = assetInfo.pageName
	}

	return {
		...assetInfo,
		text: pageText,
		title,
	}
}

// previous and next pages are determined by their alphabetical order in a directory.
// note that you can number pages to ensure that they order properly
// the predicate takes an assetInfo as input, and returns true if it's a valid page
// this is a way to skip files that aren't pages, or index files.
// example: 01-title.md
const getPreviousPage = async (baseDir, targetFile, predicate) => {
	const assetInfo = await getAssetInfo(baseDir, targetFile);

	const possiblePages = fs.readdirSync(assetInfo.dir);
	const startIndex = possiblePages.indexOf(assetInfo.file);

	for (let i = startIndex - 1; i >= 0; i--) {
		const possibleFilename = possiblePages[i];
		const possibleFilePath = path.resolve(assetInfo.dir, possibleFilename);
		const newAssetInfo = await getAssetInfo(baseDir, possibleFilePath);
		if (await predicate(newAssetInfo)) {
			const newPageInfo = await getPageInfo(baseDir, possibleFilePath);
			return {
				id: newPageInfo.id,
				title: newPageInfo.title,
				url: newPageInfo.url,
			}
		}
	}

	return undefined;
}

const getNextPage = async (baseDir, targetFile, predicate) => {
	const assetInfo = await getAssetInfo(baseDir, targetFile);

	const possiblePages = fs.readdirSync(assetInfo.dir);
	const startIndex = possiblePages.indexOf(assetInfo.file);

	for (let i = startIndex + 1; i < possiblePages.length; i++) {
		const possibleFilename = possiblePages[i];
		const possibleFilePath = path.resolve(assetInfo.dir, possibleFilename);
		const newAssetInfo = await getAssetInfo(baseDir, possibleFilePath);
		if (await predicate(newAssetInfo)) {
			const newPageInfo = await getPageInfo(baseDir, possibleFilePath);
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