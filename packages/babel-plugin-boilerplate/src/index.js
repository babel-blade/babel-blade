// TODO: WRITE BABEL PLUGIN
// TODO: ???
// TODO: PROFIT

/* for babel version compatibility */
import semver from 'semver'
import jsx from '@babel/plugin-syntax-jsx'
import jsx6 from 'babel-plugin-syntax-jsx'

export default ({ types: t, template, version }) => {
  const babel6 = semver.satisfies(version, '^6.0.0') // for babel version compatibility

  return {
    name: 'ast-transform', // optional
    inherits: babel6 ? jsx6 : jsx, // for babel version compatibility
    visitor: {
      Identifier(path) {
        path.node.name = path.node.name
          .split('')
          .reverse()
          .join('')
      },
    },
  }
}
