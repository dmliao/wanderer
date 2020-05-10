# Reorganization

This has gotten big enough that I need to probably separate it out and test it properly. And maybe use Typescript.

## Wanderer Pipeline

### Creating SiteInfo

SiteInfo tells us the global site information, where things are stored, etc.

globalConfig
contentDir
frameDir
buildDir
cacheDir

|
v

genSiteInfo

|
v

siteInfo object

### Creating Asset / Page Info

siteInfo object
file path

|
v

configure (which uses frontmatter)

|
v

pageInfo object

### listing out pages

siteInfo object -> touch -> filepaths[]

### creating plugins

siteInfo -> genPlugins -> pluginList[]

### creating a cache (used only to create feeds and page links)

siteInfo
filepaths[]
pluginList[]

|
v

cache

### build out pages

siteInfo
file path
pluginList[]
cache

|
v

builder

|
v

site!!!