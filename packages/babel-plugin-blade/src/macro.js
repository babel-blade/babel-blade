const {createMacro} = require('babel-plugin-macros')
// const {getReplacement} = require('./helpers')
const {handleCreateRazor} = require('./index')

module.exports = {
  createQuery: createMacro(bladeMacros),
  createFragment: createMacro(bladeMacros),
}

function bladeMacros({references, state, babel: {types: t}}) {
  references.createQuery.forEach(referencePath => {
    handleCreateRazor(referencePath, t)
  })
  references.createFragment.forEach(referencePath => {
    handleCreateRazor(referencePath, t)
  })
}
