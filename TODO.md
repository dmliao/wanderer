[ ] - separate out module and CLI
[ ] - create system for adding in extra parsers (mainly so I can include stage parsers. Plugins?)

Plugins are single functions, given the following args:

const plugin = (opts) => {
	/*
	opts = {
		fileInfo: touchedFile,
		baseFrameDir,
		targetDirPath,
		cache,
		tools: {
			harpe,
			template,
			findStatics,
			createPrettyUrlPage
		}
	}
	*/

	// do things
}

register a plugin by setting the file extension, and the plugin function
wanderer({
	plugins: {
		'md': pluginFunction,
		'stage', pluginFunction,
		...
	}
})

CLI runs with no plugins.