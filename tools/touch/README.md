# touch

A utility that returns a list of files that were modified after a given date. Used by wanderer to do partial builds, eventually.

## TODO

* Remove the `dayjs` dependency. It's probably unneeded.
* Add the folder and project-level config at this level. We can use it to process which files need to be processed (even if they didn't change), and also add the config pre-made to the finished result.
    * This also allows us to do some preprocessing! e.g. private files can be cut while doing the file walk.