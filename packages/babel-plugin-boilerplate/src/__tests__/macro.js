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
      import boilerplate from '../macro'
      const greeting = 'Hello world!'
      boilerplate\`module.exports = "module.exports = '\${greeting}';"\`
    `,
    // 'as function': `
    //   const myCodgen = require('../macro')
    //   myCodgen(\`
    //     module.exports = "var x = {booyah() { return 'booyah!'; } };"
    //   \`)
    // `,
    // 'as jsx': `
    //   const boilerplate = require('../macro')
    //   const ui = (
    //     <boilerplate>{"module.exports = '<div>Hi</div>'"}</boilerplate>
    //   )
    // `,
    // 'as jsx with tag': `
    //   const boilerplate = require('../macro')
    //   const ui = (
    //     <boilerplate>{\`module.exports = '<div>Hi</div>'\`}</boilerplate>
    //   )
    // `,
    // 'with multiple': `
    //   import boilerplate from '../macro'

    //   boilerplate\`module.exports = ['a', 'b', 'c'].map(l => 'export const ' + l + ' = ' + JSON.stringify(l)).join(';')\`
    // `,
    // 'as require call': `
    //   import boilerplate from '../macro';
    //   var x = boilerplate.require('./fixtures/return-one');
    // `,
    // 'invalid usage: as fn argument': {
    //   code: `
    //     import boilerplate from '../macro';
    //     var x = doSomething(boilerplate);
    //   `,
    //   error: true,
    // },
    // 'invalid usage: missing code string': {
    //   code: `
    //     import boilerplate from '../macro';
    //     var x = boilerplate;
    //   `,
    //   error: true,
    // },
  },
})
