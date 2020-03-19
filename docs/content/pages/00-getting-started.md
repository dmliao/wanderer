# Getting Started

## Usage

There are two main parts to a wanderer site: the `frame`, which contains layouts, templates, and global static files, and the `content`, which contains text, image assets, and any other site-specific content.

`wanderer` ships as a Node.JS CLI interface:

```
wanderer -i ./path/to/content -f ./path/to/frame -o ./build
```

The full list of CLI variables are as follows:

| flag | short name | default | description
| --in $1 | -i | ./content |path to the content directory defined in $1
| --frame $1 | -f | ./frame | path to the frame directory defined in $1
| --out $1 | -o | ./build | path to the output directory defined in $1
| --cache $1 | -a | ./.cache | path to the cache directory. The cache is used to speed up partial builds.
| --config $1 | -c | ./config.toml | path to a TOML config file for wanderer
| --clean | | | If set, will delete the output directory before building

You can call wanderer without any arguments to build a site defined in `./frame` and `./content` with an optional `./config.toml` configuration file defined.

This documentation is a wanderer site!