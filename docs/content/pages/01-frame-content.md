# Directory Structure

`wanderer` splits up the content and the layout into two separate directories. Each file in the content directory (and subdirectories) is processed, possibly rendered into layouts defined in the frame, and then output into the build directory.

## Content

Content is anything that goes onto the website: images, text content, and other things like styles and page-level JS.

By default, wanderer processes Markdown files and image files (reducing filesize), and copies over other files as is to the output directory.

> This section is still a work in progress!

### Pretty URLs

As part of the parsing process, wanderer may change the directory that the content file is eventually saved to, based on the following rules:

* index files are saved as-is, as are 404 files
* all other files are saved as an index within a folder with the same original id as the file, so that in browser you can render `/page-name/` vs `/page-name.html`
* the `id` of a page is taken from the filename. However, if you start a filename with a number or a [tempo date string](./dates) followed by a hyphen, the id will strip that from the final url. For example:

```
filename.md -> filename
getting-started.md -> getting-started
03-numbered-name.md -> numbered-name
19k13-dated-file.md -> dated-file
```

**Do note that if you write two files with the same id but different prefixed numbers, wanderer will treat them as one and the same.** Also note that when writing content with urls, wanderer will not automatically transform your urls to the correct id, so make sure that you don't include prefix numbers or dates in them.

> The URL resolving scheme is fairly wonky right now - it auto-adjusts for the pretty urls, but not for different ids or relative pathing because of configuration directory changes. In the meantime, the best I have to offer is that the build directory does not obfuscate anything and should be fairly straightforward, so you can see where all your built files ended up.

## Frame

The **frame** defines the site's layout, and can also include files that impact every page on the site. The directory structure of the frame is as follows:

```
- frame
	- layouts
		- default.html
		...
	- static
		- favicon.png
		- style.css
		...
```

The `layouts` directory provides the templates that pages render into. The `static` directory contains assets that are processed through wanderer like typical content would be, and are stored specially in the `static` directory of the output. The files in the `static` directory are the only files in the `frame` directory that are processed like content would be.