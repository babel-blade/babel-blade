const { createMacro } = require('babel-plugin-macros');
const { getReplacement } = require('./helpers');

module.exports = createMacro(prevalMacros);

function prevalMacros({ references, state, babel }) {
	// do something here
}
