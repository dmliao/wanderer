# Directory Structure

`wanderer` splits up the content and the layout into two separate directories. Each file in the content directory (and subdirectories) is processed, possibly rendered into layouts defined in the frame, and then output into the build directory.

## Content

Content is anything that goes onto the website: images, text content, and other things like styles and page-level JS.

By default, wanderer processes Markdown files and image files (reducing filesize), and copies over other files as is to the output directory.

> This section is still a work in progress!

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