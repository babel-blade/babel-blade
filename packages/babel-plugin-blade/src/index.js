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
 * 1. for each razor
 * 	for each call of the razor that is assigned, that is a blade
 * 		we call parseBlade on the blade
 *
 * 2. parseBlade
 *  only assignment targets are blades
 *    process each reference (variable declarator and standalone) at once
 *
 * 2.1 process reference
 *    lhs = process LHS
 *    rhs process RHS
 *    merge(lhs, rhs)
 *    parseBlade on all assign targets (if any)
 *
 * 2.2 process LHS
 *    get LHS (either id or objectpattern's key)
 *
 * 2.3 process RHS
 *    get RHS list
 *
 * 2.4 merge()
 *    added properties can come from either lhs or rhs. rhs taking precedence
 *      rhs.foreach - call add, return child, call add again
 *      lhs.foreach - ???
 *    if rhs and lhs has no kids, just an assign, just tag the blade and early exit
 *    else, sequence is:
 *      .add from rhs, including args
 *      at the end of rhs, if there is an alias, assign the alias too
 *      if lhs has kids, keep .adding, including alias
 *
 * 3.	once all blades are parsed, compose and insert the graphql query where the razor is referenced
 *
 * LHS cases to handle:
 * - const var1 = DATA
 * - const { var2 } = DATA
 * - const { var3, var4 } = DATA
 * - const { var5: var6  } = DATA
 * - const { var7: { var8: var9} } = DATA
 *
 * interaction cases to handle:
 * - const var1 = DATA.v2
 * - const { var2 } = DATA.v2
 * - const { var3, var4 } = DATA.v2
 * - const { var5: var6  } = DATA.v2
 * - const { var7: { var8: var9} } = DATA.v2
 *
 * RHS cases
 * - const var1 = DATA.v3
 * - const var2 = DATA.v3.var3
 * - const var4 = DATA.v3.var5
 * - const var6 = DATA.v3({ foo: 1, bar: 2})
 * - const var7 = DATA.v3({ foo: 3, bar: 4}).var8
 * - DATA.v3.var8 // no assignment!
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
}

function parseBlade(path, id, razorData, slice = 0) {
  let refs = path.scope.bindings[id] && path.scope.bindings[id].referencePaths
  // console.log('parseblade', { refs, id, razorData, path });
  if (slice) refs = refs.slice(slice)
  if (refs && refs.length > 0) {
    // there has been an assignment and it has been used
    refs.forEach(blade => {
      const LHS = processReference(blade, razorData)
      // call parseblade on all LHS
    })
  } else {
    // there has been no assignment or it has not been used
    const bladeID = getObjectPropertyName(path)
    console.log('lskdj', bladeID)
    if (bladeID) {
      const propID = getObjectPropertyName(path)
      const child = razorData.add({name: propID})
      parseBlade(path.parentPath, propID, child)
    }
  }
}

function processReference(blade, razorData) {
  let LHS, RHS

  /***** PROCESS LHS *****/
  // for now LHS processing goes a maximum of one level.
  // will implement multilevel later

  // find declarator parent context
  const ctx = blade.findParent(
    ppath =>
      ppath.isVariableDeclarator() && ppath.scope.uid === blade.scope.uid,
  )
  if (ctx) {
    // then there is assignment
    // if it is a top level assign, its a plain alias
    if (ctx.node.id.name) {
      LHS = ctx.node.id.name
    } else {
      LHS = processLHS(ctx)
    }
  }

  /***** PROCESS RHS *****/

  // doing this just to read chained objects (eg foo.bar.baz)
  // from left to right instead of
  // babel AST which makes us read from right to left
  RHS = []
  let args // communicates across instances since we do the drop
  const RHSVisitor = {
    MemberExpression(childpath) {
      if (isCallee(childpath)) {
        args = getCalleeArgs(childpath) // fancy!
        childpath.parentPath.replaceWith(childpath) // drop the args
      } else {
        RHS.push({name: childpath.node.property.name, args})
        if (args) args = null // clear it if used
      }
    },
  }
  if (ctx) {
    ctx.traverse(RHSVisitor)
  } else {
    // even if there is no assignment, still need to traverse the kids
    blade.findParent(ppath => !ppath.isMemberExpression()).traverse(RHSVisitor)
  }
  RHS = RHS.reverse() // annoying bc of how the AST works

  console.log('sdlk', {ctx, blade, LHS, RHS})

  /***** MERGE LHS AND RHS *****/

  // RHS FIRST: rhs.foreach - call add, return child, call add again
  let currentData = razorData
  RHS.forEach(({args, name}) => {
    // console.log({name, args, currentData})
    currentData = currentData.add({name, args: args}) // add fragments, directives later
  })

  // LHS second: lhs.foreach
  if (typeof LHS === 'string') {
    // simple assignment
    parseBlade(blade.parentPath, LHS, currentData)
  } else if (Array.isArray(LHS)) {
    // there has been a destructuring!
    let LHSpointer = currentData
    LHS.forEach(({name, alias}) => {
      LHSpointer = currentData.add({name})
      //const temp = blade.scope.bindings[alias]
      //console.log(alias, blade, temp)
      parseBlade(blade.parentPath, alias, LHSpointer, 1)
    })
  }

  // helper functions

  function processLHS(ctx) {
    // if it is an object destructure, push and recurse
    let lhs = []
    const props = ctx.node.id.properties
    if (props) {
      props.forEach(prop => {
        const k = prop.key.name
        const maybeV = prop.value.properties
        if (maybeV) {
          // multilayers, recurse
          throw new Error('multilayer destructure not implemented yet')
        } else {
          // lhs and rhs, no multilayer
          lhs.push({
            name: k,
            alias: prop.value.name,
          })
        }
      })
      return lhs // normal terminate
    }
    // shouldnt get here
    console.log('please examine this', ctx)
  }
}
