# wanderer

A static site generator written with NodeJS.

## Goals

* content written in .md or .html, using custom parsers so I can modify the authoring scheme whenever I want
* separated concerns for content and layout, with a content folder that can live wherever (...like a synced folder, for example)
* few dependencies. I don't go for zero dependencies, but I'd rather that the dependencies I bring in have zero dependencies of their own. Keep the node_modules folder from exploding.
    * This does eliminate a lot of JS build tools, so no webpack or parcel for any of the frontend files. I might add some CSS preprocessing but that will also be tricky.

## Usage

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

## TODO

* Figure out a method for handling lists and feeds. We don't want to have to add them to the build for every file, so we'll need some method to add to a specific page that those features are being used. (Probably in page level config.)
    * Lists will also make `touch` a bit more complicated, as any file that pulls content from a different directory will need to be accounted for by touch.
* Actually use it to build a website - this is mostly in 'thought experiment' level of implementation, and so probably has edge cases I haven't considered
* Create a method to compress images and automatically create favicons