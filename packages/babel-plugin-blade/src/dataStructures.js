// attempt at making a standalone testable data structure

const {maybeGetSimpleString, getSimpleFragmentName} = require('./helpers')

// we could make razordata and bladedata inherit from a common class
// but honestly didnt want to prematurely optimize

/* eslint-disable complexity */
/* eslint-disable prefer-const */
/* eslint-disable no-use-before-define */

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
    let preferredNameOrAlias =
      val.args && val.args.length ? hashArgs(val.args, val.name) : val.name
    let child = this.get(preferredNameOrAlias)
    // eslint-disable-next-line
    if (child && child._alias == hashArgs(val.args, val.name)) {
      // intentional == here
      // child = child;
    } else {
      // console.log('adding new child ', val.name, 'because', child && child._alias, 'vs', hashArgs(val.args, val.name))
      child = new BladeData(val)
      this._children.push(child)
    }
    return child // return child so that more operations can be made
  }
  print() {
    let fields = this._children
    if (!fields.length)
      return (
        /* eslint-disable-next-line */
        console.log(
          'babel-blade Warning: razor with no children, doublecheck',
        ) || null
      ) // really shouldnt happen, should we throw an error?
    let maybeArgs = coerceNullLiteralToNull(this._args && this._args[0])
    let TemplateLiteral = appendLiterals()
    if (this._type === 'query') {
      TemplateLiteral.addStr(`\nquery ${this._name || ''}`)
    } else {
      // have to make fragment name parametric
      TemplateLiteral.addStr(`\nfragment `)
      TemplateLiteral.addLit(this._name)
      TemplateLiteral.addStr(` on ${this._fragmentType}`)
    }
    TemplateLiteral.addStr(maybeArgs ? '(' : '')
      .addLit(maybeArgs)
      .addStr(maybeArgs ? ')' : '')
      .addStr('{\n')
    let indent = '  '
    let fragments = [] // will be mutated to add all the fragments included
    let accumulators = Object.keys(fields).map(key =>
      fields[key].print(indent, fragments),
    )
    accumulators.forEach(TemplateLiteral.append)
    TemplateLiteral.addStr('}') // cap off the string
    if (fragments.length) {
      fragments.forEach(frag => {
        TemplateLiteral.addStr('\n\n')
        TemplateLiteral.addLit(frag)
      })
    }
    return zipAccumulators(TemplateLiteral.get())
  }
}
export class BladeData {
  constructor({name = null, args = [], fragments = [], directives = []}) {
    if (!name) throw new Error('new Blade must have name')
    if (!Array.isArray(fragments)) throw new Error('fragments must be array')
    this._children = [] // store of child blades
    this._name = name // a string for now
    this._args = args // array
    this._alias = hashArgs(this._args, this._name)
    this._fragments = fragments.map(frag => {
      frag.isFragment = true
      return frag
    }) // tagging the literal as fragment for printing
    this._directives = directives
  }
  get(id) {
    for (let i = 0; i < this._children.length; i++) {
      if (this._children[i]._name === id) return this._children[i]
      if (this._children[i]._alias === id) return this._children[i]
    }
    return null
  }
  add(val) {
    let child = this.get(val.name)

    /* eslint-disable-next-line */
    if (child && child._alias == hashArgs(val.args, val.name)) {
      // if (child && child._alias == val.alias) { // intentional ==
      // if (child) { // intentional ==
    } else {
      // console.log('adding new child2 because', child && child._alias, val.alias)
      child = new BladeData(val)
      this._children.push(child)
    }
    return child
  }
  // TODO: potential problem here if blade has args/alias but no children
  print(indent, fragments) {
    let maybeArgs = this._args.length && this._args
    let maybeDirs = this._directives.length && this._directives
    let alias = this._alias
    let printName = alias ? `${alias}: ${this._name}` : this._name
    if (this._fragments.length)
      this._fragments.map(frag => fragments.push(frag)) // mutates fragments!
    let TemplateLiteral = appendLiterals()
      .addStr(`${indent}${printName}`)
      .addStr(maybeArgs ? '(' : '')
    if (maybeArgs) {
      maybeArgs.forEach((arg, i) => {
        if (i !== 0) TemplateLiteral.addStr(', ')
        TemplateLiteral.addLit(arg)
      })
    }
    TemplateLiteral.addStr(maybeArgs ? ')' : '')
    if (maybeDirs) {
      TemplateLiteral.addStr(' ')
      maybeDirs.forEach((dir, i) => {
        if (i !== 0) TemplateLiteral.addStr(' ')
        TemplateLiteral.addLit(dir)
      })
    }
    let fields = this._children
    if (fields.length || this._fragments.length) {
      TemplateLiteral.addStr(' {\n')
      let accumulators = Object.keys(fields).map(key =>
        /* eslint-disable-next-line */
        fields[key].print(indent + '  ', fragments),
      )
      accumulators.forEach(TemplateLiteral.append)
      this._fragments.forEach(frag => {
        TemplateLiteral.addStr(`${indent}  ...${getSimpleFragmentName(frag)}\n`)
      })
      TemplateLiteral.addStr(`${indent}}\n`) // cap off the query
    } else {
      TemplateLiteral.addStr('\n')
    }
    return TemplateLiteral.get()
  }
}

export function hashArgs(args = [], name) {
  return args.length ? `${name}_${hashCode(JSON.stringify(args))}` : null
}

// https://stackoverflow.com/a/8831937/1106414
function hashCode(str) {
  let hash = 0
  if (str.length === 0) {
    return hash
  }
  for (let i = 0; i < str.length; i++) {
    let char = str.charCodeAt(i)

    /* eslint-disable-next-line */
    hash = (hash << 5) - hash + char

    /* eslint-disable-next-line */
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString(16).slice(-4) // last4hex
}

function appendLiterals() {
  let stringAccumulator = []
  let litAccumulator = []
  let me = {
    addStr(str = null) {
      stringAccumulator.push(str)
      litAccumulator.push(null)
      return me
    },
    addLit(lit = null) {
      stringAccumulator.push(null)
      litAccumulator.push(lit)
      return me
    },
    add(str = null, lit = null) {
      stringAccumulator.push(str)
      litAccumulator.push(lit)
      return me
    },
    append(newMe) {
      newMe.stringAccumulator.forEach(str => stringAccumulator.push(str))
      newMe.litAccumulator.forEach(lit => litAccumulator.push(lit))
      return me
    },
    get() {
      return {stringAccumulator, litAccumulator}
    },
  }
  return me
}

function zipAccumulators({stringAccumulator, litAccumulator}) {
  // cannot have any spare

  /* eslint-disable-next-line */
  let str = '',
    newStrAcc = [],
    newLitAcc = []
  for (let i = 0; i < stringAccumulator.length; i++) {
    if (litAccumulator[i]) {
      let maybeSimpleString = maybeGetSimpleString(litAccumulator[i])
      if (maybeSimpleString) {
        // its just a simplestring!
        str += maybeSimpleString
      } else {
        newLitAcc.push(litAccumulator[i])
        newStrAcc.push(str + (stringAccumulator[i] || ''))
        str = ''
      }
    } else {
      // there is an empty lit, store in state
      str += stringAccumulator[i] || ''
    }
  }
  // flush store
  if (str !== '') newStrAcc.push(str)
  return {stringAccumulator: newStrAcc, litAccumulator: newLitAcc}
}

function coerceNullLiteralToNull(lit) {
  return lit && lit.type === 'NullLiteral' ? null : lit
}
