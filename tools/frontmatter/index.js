const toml = require('toml')

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
            text: text
        }
    }

    const splits = text.split(startToken);
    if (splits.length <= 2) {
        return {
            config: {},
            text: text
        }
    }

    splits.shift();
    const rawFrontmatter = splits.shift()
    try {
        const frontmatter = toml.parse(rawFrontmatter);

        const result = {
            config: frontmatter,
            text: splits.join(startToken)
        }

        return result;
    } catch (e) {
        console.log(e)
        return undefined
    }
    
}

module.exports = frontmatter