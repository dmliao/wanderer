const getConfiguration = require('./configuration');
const asset = require('./asset-info');

module.exports = {
	getConfiguration,
	...asset
}