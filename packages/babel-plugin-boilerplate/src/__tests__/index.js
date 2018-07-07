import path from 'path'
import pluginTester from 'babel-plugin-tester'
import plugin from '../'

const projectRoot = path.join(__dirname, '../../')

expect.addSnapshotSerializer({
  print(val) {
    return val.split(projectRoot).join('<PROJECT_ROOT>/')
  },
  test(val) {
    return typeof val === 'string'
  },
})

pluginTester({
  plugin,
  snapshot: true,
  babelOptions: {filename: __filename},
  tests: {
    // 'does not touch non-codegen code': {
    //   snapshot: false,
    //   code: 'const x = notCodegen`module.exports = "nothing"`;',
    // },
    'basic value': 'const x = codegen`module.exports = "1"`',
    // 'simple variable assignment':
    //   'codegen`module.exports = "var x = \'some directive\'"`',
    // 'object with arrow function': `
    //   const y = codegen\`
    //     module.exports = '({booyah: () => "booyah"})'
    //   \`
    // `,
    // 'must export a string': {
    //   code: 'const y = codegen`module.exports = {}`',
    //   error: true,
    // },
    // 'codegen comment': `
    //   // @codegen
    //   const array = ['apple', 'orange', 'pear']
    //   module.exports = array
    //     .map(fruit => \`export const \${fruit} = "\${fruit}";\`)
    //     .join('')
    // `,
    // 'dynamic value that is wrong': {
    //   code: `const x = codegen\`module.exports = "\${dynamic}"\``,
    //   error: true,
    // },
    // 'import comment': 'import /* codegen */ "./fixtures/assign-one.js"',
    // 'import comment with extra comments after':
    //   'import /* codegen */ /* this is extra stuff */ "./fixtures/assign-one.js"',
    // 'import comment with extra comments before':
    //   'import /* this is extra stuff */ /* codegen */ "./fixtures/assign-one.js"',
    // 'does not touch import comments that are irrelevant': {
    //   code: 'import /* this is extra stuff */"./fixtures/assign-one.js";',
    //   snapshot: false,
    // },
  },
})

// // This is for any of the exta tests. We give these a name.
// pluginTester({
//   plugin,
//   snapshot: true,
//   babelOptions: {filename: __filename},
//   tests: {
//     'handles some dynamic values': `
//       const three = 3
//       const x = codegen\`module.exports = "\${three}"\`
//     `,
//     'accepts babels parser options for generated code': {
//       babelOptions: {
//         filename: __filename,
//         parserOpts: {plugins: ['flow', 'doExpressions']},
//       },
//       code: `
//         // @codegen
//         module.exports = "var fNum: number = do { if(true) {100} else {200} };"
//       `,
//     },
//   },
// })
