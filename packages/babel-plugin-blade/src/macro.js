const { createMacro, MacroError } = require('babel-plugin-macros');
// const {getReplacement} = require('./helpers')
const { handleCreateRazor } = require('./index');

export default createMacro(bladeMacros);

function bladeMacros({ references, state, babel: { types: t } }) {
	Object.keys(references).forEach(referenceKey => {
		if (referenceKey === 'createQuery' || referenceKey === 'createFragment') {
			references[referenceKey].forEach(referencePath => {
				handleCreateRazor(referencePath, t);
			});
		} else throw new MacroError('invalid require?');
	});
	// references.createQuery.forEach(referencePath => {
	//   handleCreateRazor(referencePath, t)
	// })
	// references.createFragment.forEach(referencePath => {
	//   handleCreateRazor(referencePath, t)
	// })
}
