const asset = require('./asset-info')
const fs = require('fs')

const predicate = (assetInfo) => {
	return assetInfo.path.indexOf('.md') && fs.readFileSync(assetInfo.path, 'utf-8').length > 0;
};

console.log(asset.getAssetInfo('../../test/content', '../../test/content/different_dir_test/post.md'))
console.log(asset.getPreviousPage('../../test/content', '../../test/content/blog_test/feed.md', predicate))
console.log(asset.getNextPage('../../test/content', '../../test/content/blog_test/feed.md', predicate))