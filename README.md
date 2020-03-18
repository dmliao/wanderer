# wanderer

an opinionated static site generator written in Node.JS.

[Source Code](https://github.com/dmliao/wanderer)

Is it ready for production use? It's ready in the sense that I personally use it. But it's very much a tool that's made by me, _for_ me, and thus might not be suited to your needs.

## features

* HTML templating, layouts, and partials using JS template strings.
* Write pages in a Markdown subset, or with HTML.
* flat file content structure. Builds the site in the exact structure as the source content, unless you change it.
* image processing via `Graphicsmagick` to make web-ready images
* as few dependencies as possible - most tools are created as subdirectories, and only uses npm packages that have zero dependencies of their own for text content. (Processing images and media requires more packages)

## notes

* For image compression to work properly, your computer needs both `gm` (Graphicsmagick) and `pngquant` installed and on the path.

## usage

I made the interesting choice of having multiple nested package.json files. Running npm install in the base directory should install all of them automatically, but if for some reason that fails, you'll have to go and install dependencies in each tool manually:

```
cd wanderer
npm install
cd builder
npm install
cd ..
cd touch
npm install
```

And then:

```
cd wanderer
node index -i <content folderpath> -f <frame folderpath> -o <build folderpath> -c <config filepath>
```

> If no inputs are provided, wanderer will build in the current directory, assuming that the content lives in `./content`, the frame is in `./frame`, and the build should output to `./build`
