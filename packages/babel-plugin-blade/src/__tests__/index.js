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

const error = code => ({code, error: true})
const noSnapshot = code => ({code, snapshot: false})
const fixture = filename => ({
  fixture: require.resolve(`./fixtures/${filename}`),
})

pluginTester({
  plugin,
  snapshot: true,
  babelOptions: {filename: __filename},
  tests: {
    'basic test of functionality': fixture('basic'),
    'injection of fragments': fixture('fragment'),
    // 'does not touch non-blade code': {
    //   snapshot: false,
    //   code: 'const x = notblade`module.exports = "nothing"`;',
    // },
    // 'basic value': 'const x = blade`module.exports = "1"`'
    // 'simple variable assignment':
    //   'blade`module.exports = "var x = \'some directive\'"`',
    // 'object with arrow function': `
    //   const y = blade\`
    //     module.exports = '({booyah: () => "booyah"})'
    //   \`
    // `,
    // 'must export a string': {
    //   code: 'const y = blade`module.exports = {}`',
    //   error: true,
    // },
    // 'blade comment': `
    //   // @blade
    //   const array = ['apple', 'orange', 'pear']
    //   module.exports = array
    //     .map(fruit => \`export const \${fruit} = "\${fruit}";\`)
    //     .join('')
    // `,
    // 'dynamic value that is wrong': {
    //   code: `const x = blade\`module.exports = "\${dynamic}"\``,
    //   error: true,
    // },
    // 'import comment': 'import /* blade */ "./fixtures/assign-one.js"',
    // 'import comment with extra comments after':
    //   'import /* blade */ /* this is extra stuff */ "./fixtures/assign-one.js"',
    // 'import comment with extra comments before':
    //   'import /* this is extra stuff */ /* blade */ "./fixtures/assign-one.js"',
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
//       const x = blade\`module.exports = "\${three}"\`
//     `,
//     'accepts babels parser options for generated code': {
//       babelOptions: {
//         filename: __filename,
//         parserOpts: {plugins: ['flow', 'doExpressions']},
//       },
//       code: `
//         // @blade
//         module.exports = "var fNum: number = do { if(true) {100} else {200} };"
//       `,
//     },
//   },
// })
