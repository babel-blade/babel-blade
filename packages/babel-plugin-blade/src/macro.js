const { createMacro, MacroError } = require('babel-plugin-macros');
// const {getReplacement} = require('./helpers')
const { handleCreateRazor } = require('./index');

module.exports = createMacro(bladeMacros);

function bladeMacros({ references, state, babel: { types: t } }) {
	const { JSXMacro = [], default: defaultImport = [], createQuery, createFragment } = references;

	createQuery.forEach(referencePath => handleCreateRazor(referencePath, t));
	createFragment.forEach(referencePath => handleCreateRazor(referencePath, t));
}

// module.exports = createMacro(bladeMacros);

// function bladeMacros({ references, state, babel: { types: t } }) {
// 	Object.keys(references).forEach(referenceKey => {
// 		if (referenceKey === 'createQuery' || referenceKey === 'createFragment') {
// 			references[referenceKey].forEach(referencePath => {
// 				handleCreateRazor(referencePath, t);
// 			});
// 		} else throw new MacroError('invalid require?');
// 	});
// }
