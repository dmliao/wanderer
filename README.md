# wanderer

A static site generator written with NodeJS.

## Goals

* content written in .md or .html, using custom parsers so I can modify the authoring scheme whenever I want
* separated concerns for content and layout, with a content folder that can live wherever (...like a synced folder, for example)
* few dependencies. I don't go for zero dependencies, but I'd rather that the dependencies I bring in have zero dependencies of their own. Keep the node_modules folder from exploding.
    * This does eliminate a lot of JS build tools, so no webpack or parcel for any of the frontend files. I might add some CSS preprocessing but that will also be tricky.

## Usage

I made the interesting choice of having multiple nested package.json files. There's no way to call npm install on all of them just yet, so we'll have to do it manually.

```
npm install
cd builder
npm install
cd ..
cd touch
npm install
```

And then:

```
wanderer -i <content folderpath> -f <frame folderpath> -o <build folderpath> -c <config filepath>
```

> If no inputs are provided, wanderer will build in the current directory, assuming that the content lives in `./content`, the frame is in `./frame`, and the build should output to `./build`