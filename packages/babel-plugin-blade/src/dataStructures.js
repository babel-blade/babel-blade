// attempt at making a standalone testable data structure

// we could make razordata and bladedata inherit from a common class
// but honestly didnt want to prematurely optimize

export class RazorData {
  constructor({args = null, name = null, type = null, fragmentType = null}) {
    if (!type) throw new Error('type must be either fragment or query')
    if (type === 'fragment' && !fragmentType)
      throw new Error('fragments must come with a fragmentType')
    if (type === 'fragment' && !name)
      throw new Error('fragments must come with a name')
    this._children = [] // all the blades
    this._args = args // a string for now
    this._name = name // truly optional
    this._type = type // either 'fragment' or 'query'
    this._fragmentType = fragmentType // if fragment
  }
  isFragment() {
    return this._type === 'fragment'
  }
  getFragmentData() {
    return {
      name: this._name,
      fragmentType: this._fragmentType,
    }
  }
  get(id) {
    for (let i = 0; i < this._children.length; i++) {
      const name = this._children[i]._name === id
      const alias = this._children[i]._alias === id
      if (name || alias) return this._children[i]
    }
    return null
  }
  add(val) {
    let child = this.get(val.name)
    if (child && child._alias == val.alias) {
      // child = child;
    } else {
      child = new BladeData(val)
      this._children.push(child)
    }
    return child // return child so that more operations can be made
  }
  print() {
    let fields = this._children
    if (!fields.length)
      return (
        console.log(
          'babel-blade Warning: razor with no children, doublecheck',
        ) || null
      ) // really shouldnt happen, should we throw an error?
    let printArgs = this._args ? `(${this._args})` : ''
    let GraphQLString =
      this._type === 'query'
        ? `\nquery ${this._name || ''}${printArgs}{\n`
        : `\nfragment ${this._name} on ${this._fragmentType}{\n`
    let indent = '  '
    let fragments = [] // will be mutated to add all the fragments included
    let fieldStrings = Object.keys(fields).map(key =>
      fields[key].print(indent, fragments),
    )
    fieldStrings.forEach(str => (GraphQLString += str))
    GraphQLString += '}' // cap off the string
    fragments.forEach(frag => (GraphQLString += frag.print()))
    return GraphQLString
  }
}
export class BladeData {
  constructor({
    name = null,
    args = null,
    alias = null,
    fragments = [],
    directive = null,
  }) {
    if (!name) throw new Error('new Blade must have name')
    if (!Array.isArray(fragments)) throw new Error('fragments must be array')
    this._children = [] // store of child blades
    this._name = name // a string for now
    this._args = args // a string for now
    this._alias = alias // truly optional
    this._fragments = fragments
    this._directive = directive

    // binding cos im too lazy to set up public class fields
    // this.get = this.get.bind(this);
    // this.add = this.add.bind(this);
    // this.print = this.print.bind(this);
  }
  get(id) {
    for (let i = 0; i < this._children.length; i++) {
      if (this._children[i]._name === id) return this._children[i]
    }
    return null
  }
  add(val) {
    let child = this.get(val.name)
    if (child && child._alias == val.alias) {
      // child = child.add(val);
    } else {
      child = new BladeData(val)
      this._children.push(child)
    }
    return child
  }
  print(indent, fragments) {
    // TODO: potential problem here if blade has args/alias but no children
    let printArgs = this._args ? `(${this._args})` : ''
    let printName = this._alias ? `${this._alias}: ${this._name}` : this._name
    let printDirectives = this._directive ? ` ${this._directive}` : ''
    if (this._fragments.length)
      this._fragments.map(frag => fragments.push(frag)) // mutates fragments!
    let GraphQLString = `${indent}${printName}${printArgs}${printDirectives}`
    let fields = this._children
    if (fields.length || this._fragments.length) {
      GraphQLString += ' {\n'
      let fieldStrings = Object.keys(fields).map(key =>
        fields[key].print(indent + '  ', fragments),
      )
      fieldStrings.forEach(str => (GraphQLString += str))
      this._fragments.forEach(
        frag =>
          (GraphQLString += `${indent}  ...${frag.getFragmentData().name}\n`),
      )
      GraphQLString += `${indent}}\n` // cap off the query
    } else {
      GraphQLString += `\n`
    }
    return GraphQLString
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
