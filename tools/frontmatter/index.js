const toml = require('toml')

const frontmatter = (text) => {
    if (!text.startsWith('---')) {
        return {
            config: {},
            text: text
        }
    }

    const splits = text.split('---');
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
            text: splits.join('---')
        }

        return result;
    } catch (e) {
        console.log(e)
        return undefined
    }
    
}

module.exports = frontmatter