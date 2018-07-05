const p = require('path');

module.exports = {
	getReplacement,
	requireFromString
};

function requireFromString({ string: stringToPreval, fileOpts: { filename }, args = [] }) {
	console.log('hello there');
}

function getReplacement({ string, fileOpts, args, babel }) {
	console.log('hello there');
}
