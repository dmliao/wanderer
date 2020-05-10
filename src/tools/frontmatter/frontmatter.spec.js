const frontmatter = require('./index')

frontmatter.streamFrontmatter('../../test/content/blog_test/feed.md').then(config => {
	console.log(config)
})


frontmatter.streamFrontmatter('../../test/content/images_test/bread-food-brunch-lunch.jpg').then(config => {
	console.log(config)
})

console.log(frontmatter.getTextAfterFrontmatter('../../test/content/blog_test/feed.md'))