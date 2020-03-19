# Templating

wanderer by default uses a custom templating language that uses JS template strings.

## Example

```
import head from './partials/head.html'
import scripts from './partials/scripts.html'
import post from './partials/post.html'

<!DOCTYPE html>
<html>
  ${partials.head}
  <body>
    <section id="main">
        ${o.content}
    </section>
    
    ${partials.scripts}
  </body>
</html>

```


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

## Special Variables

Certain variables are injected into every single page in wanderer, and can be called from templates without any other configuration:

`content` - this is where the page's content as HTML will render.

`title` - This can be user-defined, but if it is not, wanderer will take the title of the page from the first line of the content (if that line is a header)

`date` - a `Date` object that contains the date of the file. Can be set in the following ways, with later options overriding earlier ones:

* the modification date of the source page file on disk
* as a string in the filename of the page file on disk (separated from the remainder of the filename by hyphen)
* manually as a config value in the file

`updated` - a `Date` object that contains the last time the page file was modified. Can be the same as or different from `date` depending on how `date` is set.

`previous` - an object with the following format:

```
{
    url: page_url
    title: page_title
    id: page_id
}
```

that holds information for the previous page in the _same source directory_ as the current page, in alphabetical order. Indexes are skipped, and thus don't have previous pages nor are seen as previous pages (as are private and empty pages).

`next` - An object with the same format as `previous`, except for the next alphabetical page in the _same source directory_. Again, indexes are skipped.

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

## Configuration

The configuration object passes variables to the template, some of which may be [defined by site or page level configuration](./configuration). Any top-level variables are passed to the template as-is, and any key that begins with `_` pass special values to the template:

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

> Technically, this entire object gets passed into the template as the `o` object. So you could use _baseDir and other 'special' fields in your templated HTML too, if you really wanted to.

These special fields include:

* `_baseDir`: used to determine relative imports within the template, which defaults to `process.cwd()` (aka the current working directory).
* `_partials`: used to pass a list of partials directly into the template, without importing.
