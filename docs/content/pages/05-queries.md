# Queries in Wanderer

wanderer builds the site page by page, but this can fall apart in the case of blog indices. Thus, there's also a capability of creating various `feeds` that can be used to list out pages.

## Defining feeds in config

Feeds are defined under the `feeds` header in page level configurations:

```
[feeds]
feedName = { tags = { like = 'feedTag' }  }
```

* if the feedName is a string, we assume that the feed should be made of the files whose **source directories** fall under that string
* if the feedName is a dict, we search the database for pages whose configurations matches that dict. Generally, this is applicable for creating feeds by tag.

All feeds are also fed into the templates as `o.feeds.feedName`, and can then be used in content:

```
# Blog posts

${o.feeds.feedName.map(item => {
    return `# ${item.title}
    ${item.description}`
}).join('')}
```

[Reference](https://benfrain.com/html-templating-with-vanilla-javascript-es2015-template-literals/#h-H2_2)

Note the `join` at the end. Without it, the map would be interpreted as an array, and will render with comma separators.

## Objects in a feed

```
{
    config: {}
    id: pageID
    url: absolute/link/to/page
    title: page title
    exerpt: a short excerpt (also defined in config.exerpt)
    content: full page content (be aware that nested template features won't work right)
}
```

## Dynamic Queries

Most of the time queries are static. However, in the future, there might also be support for dynamic queries by incorporating TaffyDB (already in use) and/or lunr.js (for search)

It becomes possible to, given the JSON database of all pages, filter them by tag or content.

## Variables that you can sort or query a feed by

`date`
`title`
`id`
`sourceDir`
`url`
`tags`

## Examples

Directory config for all the pages in the blog:
```
tags = ["blog", ...]
```

Blog index page:
```
+++
[feeds]

[feeds.blog]
query = { tags = { like = "blog" } }
isAscending = false
limit = 10
sortBy = 'date'
+++

# Recent Updates

!!!
${md(o.feeds.blog.slice(0, 8).map( post => {
    return `* [${post.title}](${post.url}) // ${post.tags.filter(tag => {
        return tag !== 'blog'
    }).map(tag => {
        return tag
    }).join(', ')}`
}).join('\n'))}
!!!
```
