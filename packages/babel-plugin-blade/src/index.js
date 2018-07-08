// for jsx/babel6-7 interop
import semver from 'semver'
import jsx from '@babel/plugin-syntax-jsx'
import jsx6 from 'babel-plugin-syntax-jsx'

/****
 *
 * Discussion of babel strategy
 *
 * at the top level we give users createQuery and createFragment methods.
 * when these are called and assigned, whatever identifier they get assigned to becomes a "razor".
 *
 * for each razor
 * 	for each call of the razor that is assigned, that is a blade
 * 		we call parseBlade on the blade
 * 			for each property that is assigned, that is also a blade
 * 				recursively call parseBlade on the blade
 * 	once all blades are parsed, compose and insert the graphql query where the razor is referenced
 *
 * along the way we build up a datastructure called the razorSet.
 * 	it is just a POJO with all the fields requested.
 * 	since every field can have query arguments, we store it alongside as __args
 * 	also every assigned item becomes an alias.
 *
 **/

export default function(babel) {
  const {types: t, template, traverse, version} = babel
  const babel6 = semver.satisfies(version, '^6.0.0')

  return {
    name: 'babel-blade', // not required
    inherits: babel6 ? jsx6 : jsx, // for jsx/babel6-7 interop
    visitor: {
      Identifier(path) {
        if (isCreateQuery(path) || isCreateFragment(path)) {
          // get the identifier
          const identifier = getAssignTarget(path)
          // clear the reference
          path.findParent(path => path.isVariableDeclaration()).remove()
          // traverse scope for identifier references
          const refs = path.scope.bindings[identifier].referencePaths
          if (refs.length > 0) {
            let razorID = null
            let razorType = path.parent.arguments.length
              ? path.parent.arguments[0].value
              : ''
            let queryType = isCreateFragment(path) ? 'fragment' : 'query'
            let razorSet = {} // the core datastructure
            refs.forEach(razor => {
              // go through all razors
              if (isCallee(razor)) {
                // we have been activated! time to make a blade!
                razorID = getAssignTarget(razor)
                // clear the reference
                if (razor.container.arguments[0])
                  razor.parentPath.replaceWith(razor.container.arguments[0])
                else razor.parentPath.remove()
                parseBlade(razor, razorID, razorSet, queryType)
              }
            })

            // insert query
            refs.forEach(razor => {
              if (!isObject(razor)) {
                let fragmentName = getFragmentName(razor)
                razor.replaceWith(
                  queryType === 'fragment'
                    ? generateFragment(fragmentName, razorType, razorSet)
                    : generateQuery(razorSet),
                )
              }
            })
          }
        }
      },
    },
  }

  function generateFields(obj, references, indent = '  ') {
    // console.log('generateFields', {obj, references})
    return (
      indent +
      Object.keys(obj)
        .map(key => {
          let name = key
          if (obj[key][isReference]) {
            name = `...${key[0].toLowerCase() + key.slice(1) + 'Fragment'}`
            references.add(key)
          }
          return (
            `${name}` +
            (Object.keys(obj[key]).length
              ? ` {\n` +
                generateFields(obj[key], references, indent + '  ') +
                `\n${indent}}`
              : '')
          )
        })
        .join(`\n${indent}`)
    )
  }

  function generateFragment(id, type, fields) {
    let references = new Set()
    let f = generateFields(fields, references)
    const abc = generateTemplate(
      `\nfragment ${id} on ${type} {\n${f}\n}\n`,
      references,
    )
    // return console.log('generateFragment', {abc}) || abc
    return abc
  }

  function generateQuery(fields) {
    let references = new Set()
    let f = generateFields(fields, references)
    // console.log({ fields, references });
    const abc = generateTemplate(`\nquery {\n${f}\n}\n`, references)
    // return console.log('generateQuery', {abc}) || abc
    return abc
  }

  function generateTemplate(s, references) {
    return t.templateLiteral(
      //[t.templateElement({raw: '\n'}), t.templateElement({raw: s})],
      [t.templateElement({raw: s})],
      [...references].map(ref =>
        t.memberExpression(t.identifier(ref), t.identifier('fragment')),
      ),
    )
  }
}

const isReference = Symbol('isReference')

function parseBlade(path, id, razorSet, queryType) {
  const refs = path.scope.bindings[id] && path.scope.bindings[id].referencePaths
  // console.log('parseblade', { refs, id, razorSet, path });

  if (refs && refs.length > 0) {
    // there has been an assignment and it has been used
    refs.forEach(blade => {
      if (isObject(blade)) {
        const bladeID = getAssignTarget(blade)
        if (bladeID) {
          // there was an assignment. new blade!
          safeAdd(razorSet, bladeID, {})
          parseBlade(blade, bladeID, razorSet[bladeID])
        } else {
          // no assignment. traverse children!
          const propID = getObjectPropertyName(blade)
          safeAdd(razorSet, propID, {})
          const ref = getJSXReference(blade)
          // console.log({ blade });
          if (queryType === 'fragment' && ref) {
            safeAdd(razorSet[propID], ref, {[isReference]: true})
          }
          parseBlade(blade.parentPath, propID, razorSet[propID])
        }
      } else if (isCallee(blade)) {
        // handleBlade(blade)
      } else {
        console.log('illegal call', blade)
      }
    })
  } else {
    // there has been no assignment or it has not been used
    const bladeID = getObjectPropertyName(path)
    if (bladeID) {
      const propID = getObjectPropertyName(path)
      safeAdd(razorSet, propID, {})
      parseBlade(path.parentPath, propID, razorSet[propID])
    }
  }
}

function getAssignTarget(path) {
  return path.parentPath.container.id
    ? path.parentPath.container.id.name
    : undefined
}

function getObjectPropertyName(path) {
  return path.container.property ? path.container.property.name : undefined
}

function getJSXReference(path) {
  let jsx = path.findParent(p => p.isJSXOpeningElement())
  if (jsx) {
    return jsx.node.name.name
  }
}

function getFragmentName(path) {
  if (
    path.parentPath.isAssignmentExpression() &&
    path.parent.left.type === 'MemberExpression' &&
    path.parent.left.property.name === 'fragment'
  ) {
    let name = path.parent.left.object.name
    return name[0].toLowerCase() + name.slice(1) + 'Fragment'
  }
}

function isObject(path) {
  return looksLike(path, {key: 'object'})
}

function isCallee(path) {
  let parent = path.parentPath
  return parent.isCallExpression() && path.node === parent.node.callee
}

function isArguments(path) {
  return looksLike(path, {listKey: 'arguments'})
}

function isCreateQuery(path) {
  return looksLike(path, {node: {name: 'createQuery'}})
}
function isCreateFragment(path) {
  return looksLike(path, {node: {name: 'createFragment'}})
}

function safeAdd(obj, key, val) {
  if (Object.keys(obj[key] || {}).length) {
    obj[key] = {...obj[key], ...val}
  } else obj[key] = val
}

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

function isPrimitive(val) {
  // eslint-disable-next-line
  return val == null || /^[sbn]/.test(typeof val)
}
