// TODO: WRITE BABEL PLUGIN
// TODO: ???
// TODO: PROFIT

/* for babel version compatibility */
import semver from 'semver'
import jsx from '@babel/plugin-syntax-jsx'
import jsx6 from 'babel-plugin-syntax-jsx'

export default ({ types: t, template, transformFromAst, version }) => {
  const babel6 = semver.satisfies(version, '^6.0.0') // for babel version compatibility

  /* useful examples */
  // const assignmentBuilder = template('const NAME = VALUE')

  return {
    name: 'ast-transform', // optional
    inherits: babel6 ? jsx6 : jsx, // for babel version compatibility
    visitor: {
      // Program(path,{file: {opts: fileOpts}}) {},
      // TaggedTemplateExpression(path,{file: {opts: fileOpts}}) {},
      // ImportDeclaration(path,{file: {opts: fileOpts}}) {},
      // CallExpression(path,{file: {opts: fileOpts}}) {},
      Identifier(path) {
        path.node.name = path.node.name
          .split('')
          .reverse()
          .join('')
      },
    },
  }
}

// handy utils from kent dodds
function looksLike(a, b) {
  return (
    a &&
    b &&
    Object.keys(b).every(bKey => {
      const bVal = b[bKey]
      const aVal = a[bKey]
      if (typeof bVal === 'function') {
        return bVal(aVal)
      }
      return isPrimitive(bVal) ? bVal === aVal : looksLike(aVal, bVal)
    })
  )
}
// // usage example
// const isPreval = looksLike(path, {
//   node: {
//     source: {
//       leadingComments(comments) {
//         return comments && comments.some(isPrevalComment)
//       },
//     },
//   },
// })

function isPrimitive(val) {
  // eslint-disable-next-line
  return val == null || /^[sbn]/.test(typeof val)
}
