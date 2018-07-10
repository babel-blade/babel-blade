// for jsx/babel6-7 interop
import semver from 'semver'
import jsx from '@babel/plugin-syntax-jsx'
import jsx6 from 'babel-plugin-syntax-jsx'

// data structure
const {RazorData} = require('./dataStructures')

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
 * // the below has been rewritten and is slightly outdated, see the dataStructures file
 * along the way we build up a datastructure called the razorSet.
 * 	it is just a POJO with all the fields requested.
 * 	since every field can have query arguments, we store it alongside as __args
 * 	also every assigned item becomes an alias.
 *
 **/

export default function(babel) {
  const {
    types: t,
    // template,
    // traverse,
    version,
  } = babel
  const babel6 = semver.satisfies(version, '^6.0.0')

  return {
    name: 'babel-blade', // not required
    inherits: babel6 ? jsx6 : jsx, // for jsx/babel6-7 interop
    visitor: {
      // eslint-disable-next-line complexity
      Identifier(path) {
        if (isCreateQuery(path) || isCreateFragment(path)) {
          // get the identifier
          const identifier = getAssignTarget(path)
          // clear the reference
          path.findParent(ppath => ppath.isVariableDeclaration()).remove()
          // traverse scope for identifier references
          const refs = path.scope.bindings[identifier].referencePaths
          if (refs.length > 0) {
            let razorID = null
            const fragmentType = path.parent.arguments.length
              ? path.parent.arguments[0].value
              : null
            const queryType = isCreateFragment(path) ? 'fragment' : 'query'
            const razorData = new RazorData({
              type: queryType,
              name: identifier,
              fragmentType,
              // todo: implement args
            })
            refs.forEach(razor => {
              // go through all razors
              if (isCallee(razor)) {
                // we have been activated! time to make a blade!
                razorID = getAssignTarget(razor)
                // clear the reference
                if (razor.container.arguments[0])
                  razor.parentPath.replaceWith(razor.container.arguments[0])
                else razor.parentPath.remove()
                parseBlade(razor, razorID, razorData)
              }
            })

            // insert query
            refs.forEach(razor => {
              if (!isObject(razor)) {
                //razor.replaceWithSourceString(razorData.print())
                razor.replaceWith(
                  t.templateLiteral(
                    [t.templateElement({raw: razorData.print()})],
                    [],
                  ),
                  // const fragmentName = getFragmentName(razor)
                  // queryType === 'fragment'
                  //   ? generateFragment(fragmentName, fragmentType, razorSet)
                  //   : generateQuery(razorSet),
                )
              }
            })
          }
        }
      },
    },
  }

  function parseBlade(path, id, razorData) {
    const refs =
      path.scope.bindings[id] && path.scope.bindings[id].referencePaths
    // console.log('parseblade', { refs, id, razorSet, path });

    if (refs && refs.length > 0) {
      // there has been an assignment and it has been used
      refs.forEach(blade => {
        if (isObject(blade)) {
          const bladeID = getAssignTarget(blade)
          if (bladeID) {
            // there was an assignment. new blade, with an alias
            const propID = getObjectPropertyName(blade)

            // eslint-disable-next-line
            blade.parentPath.get('property').replaceWith(t.Identifier(bladeID)) // when the query comes back it uses the alias' name
            const child = razorData.add({name: propID, alias: bladeID})
            parseBlade(blade, bladeID, child)
          } else {
            // no assignment. traverse children!
            const propID = getObjectPropertyName(blade)
            const child = razorData.add({name: propID})
            // may need to .add here in future for fragment inference
            parseBlade(blade.parentPath, propID, child)
          }
        } else if (isCallee(blade)) {
          // not needed yet
        } else {
          const bladeID = getAssignTarget2(blade)
          if (bladeID) {
            // blade was assigned without calling
            parseBlade(blade, bladeID, razorData)
          } else {
            // eslint-disable-next-line no-console
            console.warn('babel-blade: illegal call, please investigate', blade)
          }
        }
      })
    } else {
      // there has been no assignment or it has not been used
      const bladeID = getObjectPropertyName(path)
      if (bladeID) {
        const propID = getObjectPropertyName(path)
        const child = razorData.add({name: propID})
        parseBlade(path.parentPath, propID, child)
      }
    }
  }
}

/****
 *
 * Simple readable utils for navigating the path,
 * pure functions w no significant logic
 *
 */

function getAssignTarget(path) {
  return path.parentPath.container.id
    ? path.parentPath.container.id.name
    : undefined
}

function getAssignTarget2(path) {
  return path.container.id ? path.container.id.name : undefined
}

function getObjectPropertyName(path) {
  return path.container.property ? path.container.property.name : undefined
}

// function getFragmentName(path) {
//   if (
//     path.parentPath.isAssignmentExpression() &&
//     path.parent.left.type === 'MemberExpression' &&
//     path.parent.left.property.name === 'fragment'
//   ) {
//     const name = path.parent.left.object.name
//     return name[0].toLowerCase() + name.slice(1) + 'Fragment'
//   }
//   return null
// }

function isObject(path) {
  return looksLike(path, {key: 'object'})
}

function isCallee(path) {
  const parent = path.parentPath
  return parent.isCallExpression() && path.node === parent.node.callee
}

function isCreateQuery(path) {
  return looksLike(path, {node: {name: 'createQuery'}})
}
function isCreateFragment(path) {
  return looksLike(path, {node: {name: 'createFragment'}})
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
