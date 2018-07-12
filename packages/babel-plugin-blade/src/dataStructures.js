// attempt at making a standalone testable data structure

// we could make razordata and bladedata inherit from a common class
// but honestly didnt want to prematurely optimize

export class RazorData {
  constructor({ args = null, name = null, type = null, fragmentType = null }) {
    if (!type) throw new Error('type must be either fragment or query');
    if (type === 'fragment' && !fragmentType)
      throw new Error('fragments must come with a fragmentType');
    if (type === 'fragment' && !name)
      throw new Error('fragments must come with a name');
    this._children = []; // all the blades
    this._args = args; // a string for now
    this._name = name; // truly optional
    this._type = type; // either 'fragment' or 'query'
    this._fragmentType = fragmentType; // if fragment
  }
  isFragment() {
    return this._type === 'fragment';
  }
  getFragmentData() {
    return {
      name: this._name,
      fragmentType: this._fragmentType,
    };
  }
  get(id) {
    for (let i = 0; i < this._children.length; i++) {
      const name = this._children[i]._name === id;
      const alias = this._children[i]._alias === id;
      if (name || alias) return this._children[i];
    }
    return null;
  }
  add(val) {
    let child = this.get(val.name);
    if (child && child._alias == val.alias) {
      // child = child;
    } else {
      child = new BladeData(val);
      this._children.push(child);
    }
    return child; // return child so that more operations can be made
  }
  print() {
    let fields = this._children;
    if (!fields.length)
      return (
        console.log(
          'babel-blade Warning: razor with no children, doublecheck',
        ) || null
      ); // really shouldnt happen, should we throw an error?
    let maybeArgs = coerceNullLiteralToNull(this._args && this._args[0]);
    let TemplateLiteral = appendLiterals()
      .addStr(
        this._type === 'query'
          ? `\nquery ${this._name || ''}`
          : `\nfragment ${this._name} on ${this._fragmentType}`,
      )
      .addStr(maybeArgs ? '(' : '')
      .addLit(maybeArgs)
      .addStr(maybeArgs ? ')' : '')
      .addStr('{\n');
    let indent = '  ';
    let fragments = []; // will be mutated to add all the fragments included
    let accumulators = Object.keys(fields).map(key =>
      fields[key].print(indent, fragments),
    );
    accumulators.forEach(TemplateLiteral.append);
    TemplateLiteral.addStr('}'); // cap off the string
    // todo: append to accumulator
    fragments.forEach(frag => TemplateLiteral.append(frag.print()));
    const g = TemplateLiteral.get();
    // console.log({ g });
    return zipAccumulators(g);
  }
}
export class BladeData {
  constructor({ name = null, args = null, fragments = [], directive = null }) {
    if (!name) throw new Error('new Blade must have name');
    if (!Array.isArray(fragments)) throw new Error('fragments must be array');
    this._children = []; // store of child blades
    this._name = name; // a string for now
    this._args = args; // array
    let maybeArgs = coerceNullLiteralToNull(this._args && this._args[0]);
    this._alias =
      maybeArgs && `${this._name}_${hashCode(JSON.stringify(maybeArgs))}`;
    this._fragments = fragments;
    this._directive = directive;

    // binding cos im too lazy to set up public class fields
    // this.get = this.get.bind(this);
    // this.add = this.add.bind(this);
    // this.print = this.print.bind(this);
  }
  get(id) {
    for (let i = 0; i < this._children.length; i++) {
      if (this._children[i]._name === id) return this._children[i];
    }
    return null;
  }
  add(val) {
    let child = this.get(val.name);
    if (child && child._alias == val.alias) {
      // child = child.add(val);
    } else {
      child = new BladeData(val);
      this._children.push(child);
    }
    return child;
  }
  // TODO: potential problem here if blade has args/alias but no children
  print(indent, fragments) {
    let maybeArgs = coerceNullLiteralToNull(this._args && this._args[0]);
    let alias = this._alias;
    let printName = alias ? `${alias}: ${this._name}` : this._name;
    let printDirectives = this._directive ? ` ${this._directive}` : '';
    if (this._fragments.length)
      this._fragments.map(frag => fragments.push(frag)); // mutates fragments!
    // let GraphQLString = `${indent}${printName}${maybeArgs}${printDirectives}`;
    let TemplateLiteral = appendLiterals()
      .addStr(`${indent}${printName}`)
      .addStr(maybeArgs ? '(' : '')
      .addLit(maybeArgs)
      .addStr(maybeArgs ? ')' : '')
      .addStr(printDirectives);
    let fields = this._children;
    if (fields.length || this._fragments.length) {
      TemplateLiteral.addStr(' {\n');
      let accumulators = Object.keys(fields).map(key =>
        fields[key].print(indent + '  ', fragments),
      );
      accumulators.forEach(TemplateLiteral.append);
      this._fragments.forEach(frag => {
        TemplateLiteral.addStr(
          `${indent}  ...${frag.getFragmentData().name}\n`,
        );
      });
      TemplateLiteral.addStr(`${indent}}\n`); // cap off the query
    } else {
      TemplateLiteral.addStr('\n');
    }
    return TemplateLiteral.get();
  }
}

function generateFields(obj, references, indent = '  ') {
  return (
    indent +
    Object.keys(obj)
      .map(key => {
        let name = key;
        if (
          obj[key] &&
          obj[key] &&
          Object.keys(obj[key]).length &&
          obj[key].isReference()
        ) {
          name = `...${key[0].toLowerCase() + key.slice(1) + 'Fragment'}`;
          references.add(key);
        }
        return (
          `${name}` +
          (obj[key] && obj[key] && Object.keys(obj[key]).length
            ? ` {\n` +
              generateFields(obj[key], references, indent + '  ') +
              `\n${indent}}`
            : '')
        );
      })
      .join(`\n${indent}`)
  );
}

// function generateTemplate(s, references) {
// 	return t.templateLiteral(
// 		//[t.templateElement({raw: '\n'}), t.templateElement({raw: s})],
// 		[t.templateElement({ raw: s })],
// 		[...references].map(ref => t.memberExpression(t.identifier(ref), t.identifier('fragment')))
// 	);
// }

// https://stackoverflow.com/a/8831937/1106414
function hashCode(str) {
  var hash = 0;
  if (str.length == 0) {
    return hash;
  }
  for (var i = 0; i < str.length; i++) {
    var char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16).slice(-4); // last4hex
}

function appendLiterals() {
  let stringAccumulator = [];
  let litAccumulator = [];
  let me = {
    addStr(str = null) {
      stringAccumulator.push(str);
      litAccumulator.push(null);
      return me;
    },
    addLit(lit = null) {
      stringAccumulator.push(null);
      litAccumulator.push(lit);
      return me;
    },
    add(str = null, lit = null) {
      stringAccumulator.push(str);
      litAccumulator.push(lit);
      return me;
    },
    append(newMe) {
      newMe.stringAccumulator.forEach(str => stringAccumulator.push(str));
      newMe.litAccumulator.forEach(lit => litAccumulator.push(lit));
      return me;
    },
    get() {
      return { stringAccumulator, litAccumulator };
    },
  };
  return me;
}

function zipAccumulators({ stringAccumulator, litAccumulator }) {
  // cannot have any spare
  let str = '',
    newStrAcc = [],
    newLitAcc = [];
  for (var i = 0; i < stringAccumulator.length; i++) {
    if (litAccumulator[i]) {
      let maybeSimpleString = maybeGetSimpleString(litAccumulator[i]);
      if (maybeSimpleString) {
        // its just a simplestring!
        str += maybeSimpleString;
      } else {
        newLitAcc.push(litAccumulator[i]);
        newStrAcc.push(str + (stringAccumulator[i] || ''));
        str = '';
      }
    } else {
      // there is an empty lit, store in state
      str += stringAccumulator[i] || '';
    }
  }
  // flush store
  if (str !== '') newStrAcc.push(str);
  return { stringAccumulator: newStrAcc, litAccumulator: newLitAcc };
}

function maybeGetSimpleString(Literal) {
  if (Literal.type === 'StringLiteral') return Literal.value;
  if (
    Literal.type === 'TemplateLiteral' &&
    !Literal.expressions.length &&
    Literal.quasis.length === 1
  )
    return Literal.quasis[0].value.raw;
  // else
  return null;
}

function coerceNullLiteralToNull(lit) {
  return lit && lit.type === 'NullLiteral' ? null : lit;
}
