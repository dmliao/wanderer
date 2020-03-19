#! /usr/bin/env node

const toml = require('@iarna/toml')
const path = require('upath')
const fs = require('fs')

var argv = require('minimist')(process.argv.slice(2))
const wanderer = require('./index')

console.time('build')

if (argv.h || argv.help) {
	console.log(
		'Usage: wanderer -f <frame directory> -i <content directory> -o <out directory> -c <config file>'
	)
	return
}

const frameDir = argv.frame || argv.f || path.resolve(process.cwd(), 'frame')
const contentDir = argv.in || argv.i || path.resolve(process.cwd(), 'content')
const buildDir = argv.out || argv.o || path.resolve(process.cwd(), 'build')
const cacheDir = argv.cache || argv.a || path.resolve(process.cwd(), '.cache')

let metaConfig = {}

const configFile =
	argv.config || argv.c || path.resolve(process.cwd(), 'config.toml')
if (fs.existsSync(configFile)) {
	const extraConfig = toml.parse(
		fs.readFileSync(path.resolve(process.cwd(), 'config.toml'))
	)
	metaConfig = { ...metaConfig, ...extraConfig }
}

if (argv.clean) {
	// clean up cache stuff
	try {
		fs.unlinkSync(path.resolve(cacheDir, 'static', 'pages.json'))
	} catch (e) {
		// swallow it
	}

	try {
		fs.unlinkSync(path.resolve(cacheDir, 'pages.json'))
	} catch (e) {
		// swallow it
	}

	try {
		fs.unlinkSync(path.resolve(cacheDir, '.touchfile'))
	} catch (e) {
		// swallow it
	}

	fs.rmdirSync(buildDir, { recursive: true })
}

wanderer(metaConfig, frameDir, contentDir, cacheDir, buildDir).then(() =>
	console.timeEnd('build')
)
