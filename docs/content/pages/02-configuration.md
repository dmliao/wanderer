# Configuration

There are three levels of configuration for a wanderer site, all defined as TOML files:

**Site Configuration** - defined in the `config.toml` file supplied to the wanderer command. This can be used to configure plugins, or assign global values across the whole site (e.g. author)

**Directory Configuration** - defined in `_.toml` files in any content directory or subdirectory. The parameters defined in directory-level configuration applies to that directory _and all subdirectories_.

**File Configuration** - defined in individual content files as TOML frontmatter, deliminated by `---` or `+++`. Example:

```
+++
title = "Amorphic Space"
_partials = { card = "./partials/card.html" }
layout = "home"

[feeds]

[feeds.recent]
query = { tags = { like = "logs" } }
isAscending = false
limit = 10

+++

This is the actual page content.
```

Every individual page has the site config, then the directory config, then the file config applied to it.

Most configuration is used to add variables to the pages (as the page's configuration is injected into the template), but there are variables with additional effects as well:

## Site Configuration Special Variables

`plugins` - a list of strings which can be used to import plugins to parse additional content files. Can either be relative paths (to the base site directory), or names of included npm modules.

## Directory / File Configuration Special Variables

Values that are unset can take their defaults from the site configuration.

`private` - if set to `true`, then the page / directory won't be built in the final site.

`layout` - Changes the layout file that is used to build the page. Defined as a string with no extension (leave out the `.html`). All layouts should live in `frame/layouts`.

`dir` - Chooses which directory the built site file will build to, which will change the pretty URL for the page. **NOTE: the dir variable should only be set in directory-level config for now.**

`rename` - Renames the page (the last section in the URL). This should be a URL-friendly string with no extension.

`feeds` - an array that can be used to list pages in the site. [See the specific feeds page for more information](./queries)

`_partials` - adds onto the `_partials` object defined in the HTML template, which allows you to import additional partials per page. The key for each field in the object is the name of the partial, the value is the relative path from **the frame directory**. [See templating for how partials work](./templating)

`tags` - a list of strings that can be used to create feeds.
