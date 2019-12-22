const fs = require('fs');
const path = require('path');

const render = (template, config, layer) => {
    layer = layer || 0;
    if (layer > 10) {
        throw new Error("More than 10 nested imports discovered. Either you have a very deep import tree (please don't), or there's a circular import, which is not supported.")
    }
    
    const escapedTemplate = template.replace('`', '\\`');

    const o = {...config};
    const premadePartials = config._partials || {};

    // calculate imports from within the HTML file
    // imports take the form of 'import partial ./partial/file'
    const splits = escapedTemplate.split(/\r\n|\r|\n/g);
    let finishedImports = false;
    let processedTemplate = '';

    const importedPartials = {};

    for (const line of splits) {
        if (finishedImports) {
            processedTemplate += line + '\n';
            continue;
        }

        if (!line.trim().length) {
            continue;
        }

        if (line.startsWith('import ')) {
            const tokens = line.split(' ');

            if (tokens.length < 3) {
                throw new Error('Invalid import statement');
            }
            const key = tokens[1];
            const value = tokens[tokens.length - 1];

            let partialPath = value
            // spoony way to get rid of ' and "
            if (partialPath.startsWith('"') || partialPath.startsWith("'")) {
                partialPath = partialPath.slice(1)
            }

            if (partialPath.endsWith('"') || partialPath.endsWith("'")) {
                partialPath = partialPath.slice(0, partialPath.length - 1)
            }

            const baseDir = config._baseDir || process.cwd();
            importedPartials[key] = fs.readFileSync(path.resolve(baseDir, partialPath), 'utf-8');
            continue;
        }

        processedTemplate += line + '\n';
        finishedImports = true;
    }

    // end imports

    const unparsedPartials = {...premadePartials, ...importedPartials};
    const partials = {}
    for (let key of Object.keys(unparsedPartials)) {
        const p = unparsedPartials[key]

        partials[key] = render(p, o, layer + 1);
    }

    const macro = (partialName, vars) => {
        const macroConfig = {
            ...vars
        };

        if (typeof partialName !== 'string') {
            throw new Error('The macro first argument should be a string that is either the name of the partial, or a link to the partial value')
        }

        const partialValue = unparsedPartials[partialName] || partialName;
        return render(partialValue, macroConfig, layer + 1);
    }

    // create proper config file
    return eval('`' + processedTemplate + '`');
}

module.exports = render;