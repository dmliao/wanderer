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
    const frontmatter = toml.parse(splits.shift());

    const result = {
        config: frontmatter,
        text: splits.join('---')
    }

    return result;
}

module.exports = frontmatter