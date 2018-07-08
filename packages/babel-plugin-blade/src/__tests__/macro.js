import path from 'path'
import pluginTester from 'babel-plugin-tester'
import plugin from 'babel-plugin-macros'

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
  babelOptions: {filename: __filename, parserOpts: {plugins: ['jsx']}},
  tests: {
    'as tag': `
      import blade from '../macro'
      const greeting = 'Hello world!'
      blade\`module.exports = "module.exports = '\${greeting}';"\`
    `,
    // 'as function': `
    //   const myCodgen = require('../macro')
    //   myCodgen(\`
    //     module.exports = "var x = {booyah() { return 'booyah!'; } };"
    //   \`)
    // `,
    // 'as jsx': `
    //   const blade = require('../macro')
    //   const ui = (
    //     <blade>{"module.exports = '<div>Hi</div>'"}</blade>
    //   )
    // `,
    // 'as jsx with tag': `
    //   const blade = require('../macro')
    //   const ui = (
    //     <blade>{\`module.exports = '<div>Hi</div>'\`}</blade>
    //   )
    // `,
    // 'with multiple': `
    //   import blade from '../macro'

    //   blade\`module.exports = ['a', 'b', 'c'].map(l => 'export const ' + l + ' = ' + JSON.stringify(l)).join(';')\`
    // `,
    // 'as require call': `
    //   import blade from '../macro';
    //   var x = blade.require('./fixtures/return-one');
    // `,
    // 'invalid usage: as fn argument': {
    //   code: `
    //     import blade from '../macro';
    //     var x = doSomething(blade);
    //   `,
    //   error: true,
    // },
    // 'invalid usage: missing code string': {
    //   code: `
    //     import blade from '../macro';
    //     var x = blade;
    //   `,
    //   error: true,
    // },
  },
})
