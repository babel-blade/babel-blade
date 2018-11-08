const {createMacro} = require('babel-plugin-macros')
const {handleCreateRazor} = require('./index')

module.exports = createMacro(bladeMacros)

function bladeMacros({references, babel: {types: t}}) {
  const {createQuery, createFragment} = references

  ;[...createFragment, ...createQuery].forEach(referencePath =>
    handleCreateRazor(referencePath, t),
  )
}
