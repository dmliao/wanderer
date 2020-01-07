# Image processing module for wanderer

Uses `sharp` and `exiftool` to resize images, strip metadata, and finally export images from content to build.

PNG files get an extra layer of compression via `pngquant`, as `sharp` will only export lossless PNGs.