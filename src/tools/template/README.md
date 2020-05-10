# Template

JS templating engine for HTML files

```
const template = require('./template)

const result = template(templateString, {
    title: 'Hello World',
    description: 'Testing testing',
    _baseDir: __dirname
});

// result is an HTML string with the config object applied to the template
```

## Configuration

The configuration object passes variables to the template. Any top-level variables are passed to the template as-is, and any key that begins with `_` pass special values to the template:

```
{
    variable: value
    vars: are_top_level
    _baseDir: string - base to start looking for relative imports
    _partials: {
        nameOfPartial: stringOfPartial
    }
}
```

These special fields include:

* `_baseDir`: used to determine relative imports within the template, which defaults to `process.cwd()` (aka the current working directory).
* `_partials`: used to pass a list of partials directly into the template, without importing.

## Variables

All variables are stored in the `o` object:

```
/* assuming that the imported config looked like
{
    name: Amorphous
} */

// template
<h1>Hello ${o.name}</h1>

// will output
<h1>Hello Amorphous</h1>
```

## Partials

Partials are stored in the `partials` object, and can be added in config when calling template via the `_partials` field.

Any variables that are passed to the template should also be passed to relevant partials.

### Importing Partials

A template file can also import partials by calling

```
import partialName from ./partial/url

${partials.partialName}
```

At the top of the template HTML file. Note that there are no quotes, and partial URLs with spaces in them will probably not work correctly.

The `partialName` will be added to the `partials` object at time of compilation, and so can be used in that particular template file.
