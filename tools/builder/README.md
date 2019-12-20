# Builder

Tool to build the static site directory from a content and frame folder. I'll edit all this later.

## Frame

Contains all of the templates to build the site. Uses the `template` tool to do so. The frame directory requires two sub-directories:

### layouts

Contains the templates that are pulled into builder. Any content configuration can set a layout to use to render that content, and builder will search for `<name>.html` in the `frame/layouts` folder.

> If no layout is defined for a content piece, it will automatically use default.html, so make sure that frame/layouts/default.html exists!

### static

Contains resources used by the frame. Static assets are pulled into the `/static` folder in build, and are processed with the exact same rules that the content folder is. You can put content files in here, but that's not exactly recommended. Mostly used for theme css, images, or site-wide JS.

## Content

* currently supports pages as `.md` files, which are compiled via `harpe`.
* also supports `.html` pages, which are copied over as is without any compilation whatsoever. This allows you to make a complete site in the content folder if you want to, and have it ported over exactly in build.
* (TODO) it will eventually support `.htm` pages, which are html content pages that go through the template engine, but are already written as html and so don't need Markdown processing.
* Uses the exact same folder structure in the finished site as was used in the source files. Folders are URL parts, and the builder supports pretty urls

### Titles

You can prepend a date in tempo format to the front of a file, separated with a hyphen. This will add the date as a config variable (TODO), and strip that date from the url in the build

Example:

```
content_source/path/19k11-blog-post.md
```

will compile down to

```
build/path/blog-post
```

and have `November 11, 2019` as the date in config.

This is mostly to allow alphabetizing of dated posts without worrying about creation or modification dates.

> Having two files with the same name but different prepended dates is undefined behavior; only one will end up being built. Make sure that the names after the dates in your files are unique.

### Autolinking CSS and JS

A CSS file with the same name as a content file will be automatically added to the built config in the `css` variable. You can auto-include it in the result by adding:

```
${o.css ? '<link rel="stylesheet" type="text/css" href="' + o.css + '">' : ''}
```

to the frame's header.

Similarly, a JS file with the same name will automatically be added to the build config in the `js` variable, and can be auto-included as a script tag in a similar fashion.

> This currently only supports a single CSS and JS file per page.

### Content Config

There's three layers of configuration: site-wide, directory-level, and individual-file. All of them are written in TOML.

> Eventually I'd like to add JSON support too, but for now TOML it is.

Site-wide configuration is passed into the builder function, and is typically found in `config.toml` in the base directory where wanderer is run.

Directory-level configuration is written in a `_.toml` file in a content directory. This file isn't copied over to the build directory, but rather added to the configuration for that directory only. It does not apply to sub-directories.

Every built (so `.md` for now) content file can also add configuration by starting the file with `---`, adding toml-frontmatter, and ending the frontmatter with `---`

The content is passed into `template`, so any top-level values in the config can be used as variables in the frame.

#### Special config values

Work in progress. So far, there's no special-casing.