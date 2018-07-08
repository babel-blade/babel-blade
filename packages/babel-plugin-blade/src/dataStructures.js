// attempt at making a standalone testable data structure

export class RazorData {
  constructor({args = null, name = null, type = null, fragmentType = null}) {
    if (!type) throw new Error('type must be either fragment or query')
    if (type === 'fragment' && !fragmentType)
      throw new Error(
        'fragments must come with a type (usually from jsx element)',
      )
    this._children = {} // k/v store of all the blades
    this._args = args // a string for now
    this._name = name // truly optional
    this._type = type // either 'fragment' or 'query'
    this._fragmentType = fragmentType // if fragment
    // binding cos im too lazy to set up public class fields
    this.get = this.get.bind(this)
    this.add = this.add.bind(this)
    this.print = this.print.bind(this)
  }
  get(id) {
    return this._children[id]
  }
  add(key, val) {
    let obj = this._children
    if (obj[key]) {
      obj[key].add(key)
    } else obj[key] = new BladeData(val)
    this._children = obj
  }
  print() {
    // let fields = this._children;
    // let references = new Set();
    // let f = generateFields(fields, references);
    // // return generateTemplate(`\nquery {\n${f}\n}\n`, references);
    // return { f, references };
    let fields = this._children
    if (!fields) return null
    Object.keys(fields).forEach(key => {
      fields[key] = fields[key].print()
    })
    console.log({fields})
    // let references = new Set();
    // let f = generateFields(fields, references);
    // // return generateTemplate(`\nquery {\n${f}\n}\n`, references);
    // return { f, references };
    return fields
  }
}
export class BladeData {
  constructor({args = null, alias = null, isReference = false}) {
    this._children = null // k/v store of all the blades
    this._args = args // a string for now
    this._alias = alias // truly optional
    this._isReference = isReference

    // binding cos im too lazy to set up public class fields
    this.get = this.get.bind(this)
    this.add = this.add.bind(this)
    this.print = this.print.bind(this)
    this.isReference = this.isReference.bind(this)
  }
  get(id) {
    return this._children && this._children[id]
  }
  add(key, val) {
    let obj = this._children
    if (!obj) obj = {}
    if (obj[key]) {
      obj[key].add(key)
    } else obj[key] = new BladeData(val)
    this._children = obj
  }
  print() {
    let fields = this._children
    if (!fields) return null
    Object.keys(fields).forEach(key => {
      fields[key] = fields[key].print()
    })
    return fields
  }
  isReference() {
    return this._isReference
  }
}

function generateFields(obj, references, indent = '  ') {
  return (
    indent +
    Object.keys(obj)
      .map(key => {
        let name = key
        // console.log(obj, key);
        if (
          obj[key] &&
          obj[key] &&
          Object.keys(obj[key]).length &&
          obj[key].isReference()
        ) {
          name = `...${key[0].toLowerCase() + key.slice(1) + 'Fragment'}`
          references.add(key)
        }
        return (
          `${name}` +
          (obj[key] && obj[key] && Object.keys(obj[key]).length
            ? ` {\n` +
              generateFields(obj[key], references, indent + '  ') +
              `\n${indent}}`
            : '')
        )
      })
      .join(`\n${indent}`)
  )
}

// function generateTemplate(s, references) {
// 	return t.templateLiteral(
// 		//[t.templateElement({raw: '\n'}), t.templateElement({raw: s})],
// 		[t.templateElement({ raw: s })],
// 		[...references].map(ref => t.memberExpression(t.identifier(ref), t.identifier('fragment')))
// 	);
// }
