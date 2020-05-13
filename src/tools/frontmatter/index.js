const toml = require('@iarna/toml')
const fs = require('fs')
const path = require('upath')
const readline = require('readline')

const streamFrontmatter = async (filename) => {
	let startToken = ''
	const fileStream = fs.createReadStream(path.resolve(filename))

	const rl = readline.createInterface({
		input: fileStream,
		terminal: false,
	})

	let frontmatterString = ''

	for await (const line of rl) {
		const trimmedLine = line.trim()
		if (trimmedLine === '') {
			continue
		}

		// check to see if the first line is the start token
		if (startToken === '') {
			if (trimmedLine === '---') {
				startToken = '---'
				continue
			} else if (trimmedLine === '+++') {
				startToken = '+++'
				continue
			} else {
				// we abort early
				return {}
			}
		}

		if (trimmedLine === startToken) {
			try {
				// we've hit the end of frontmatter
				const frontmatter = toml.parse(frontmatterString)
				return frontmatter
			} catch (e) {
				console.log(e)
				return {}
			}
		}

		frontmatterString += line + '\n'
	}

	// if we get here, the entire thing was the frontmatter
	try {
		// we've hit the end of frontmatter
		const frontmatter = toml.parse(frontmatterString)
		return frontmatter
	} catch (e) {
		console.log(e)
		return {}
	}
}

const getTextAfterFrontmatter = (filename) => {
	const text = fs.readFileSync(path.resolve(filename), 'utf-8')
	let startToken = ''
	if (text.startsWith('---')) {
		startToken = '---'
	} else if (text.startsWith('+++')) {
		startToken = '+++'
	}
	if (!startToken) {
		return text.trim()
	}

	const splits = text.split(startToken)
	if (splits.length <= 2) {
		return text.trim()
	}

	splits.shift()

	// this gets rid of the frontmatter
	splits.shift()

	return splits.join(startToken).trim()
}

/* legacy unused function */
const frontmatter = (text) => {
	let startToken = ''
	if (text.startsWith('---')) {
		startToken = '---'
	} else if (text.startsWith('+++')) {
		startToken = '+++'
	}
	if (!startToken) {
		return {
			config: {},
			text: text,
		}
	}

	const splits = text.split(startToken)
	if (splits.length <= 2) {
		return {
			config: {},
			text: text,
		}
	}

	splits.shift()
	const rawFrontmatter = splits.shift()
	try {
		const frontmatter = toml.parse(rawFrontmatter)

		const result = {
			config: frontmatter,
			text: splits.join(startToken),
		}

		return result
	} catch (e) {
		console.log(e)
		return undefined
	}
}

module.exports = {
	streamFrontmatter,
	getTextAfterFrontmatter,
	frontmatter,
}
