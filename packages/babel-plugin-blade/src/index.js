// for jsx/babel6-7 interop
import semver from 'semver'
import jsx from '@babel/plugin-syntax-jsx'
import jsx6 from 'babel-plugin-syntax-jsx'

// data structure
const {RazorData} = require('./dataStructures')
const {
  // isPropertyCall,
  // looksLike,
  isObject,
  isCallee,
  isCreateQuery,
  isCreateFragment,
  getAssignTarget,
  getObjectPropertyName,
  getCalleeArgs,
  maybeGetSimpleString,
  getSimpleFragmentName,
} = require('./helpers')

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

/* eslint-disable complexity */
/* eslint-disable babel/new-cap */

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
      Identifier(path) {
        handleCreateRazor(path, t)
      },
    },
  }
}

export function handleCreateRazor(path, t) {
  if (isCreateQuery(path) || isCreateFragment(path)) {
    // get the identifier and available args
    const identifier = getAssignTarget(path)
    let queryArgs
    if (isCallee(path)) {
      queryArgs = getCalleeArgs(path)
    }
    // traverse scope for identifier references
    const refs = path.scope.bindings[identifier].referencePaths
    // clear the reference
    path.findParent(ppath => ppath.isVariableDeclaration()).remove()
    if (refs.length > 0) {
      let razorID = null
      if (isCreateFragment(path) && !queryArgs[0])
        throw new Error(
          'createFragment must have one argument to specify the graphql type they are on',
        )
      const fragmentType =
        isCreateFragment(path) && maybeGetSimpleString(queryArgs[0]) //getFragmentName(path)
      const queryType = isCreateFragment(path) ? 'fragment' : 'query'
      // console.log({ queryArgs, fragmentType });
      const razorData = new RazorData({
        type: queryType,
        name: isCreateFragment(path) ? t.Identifier(identifier) : identifier,
        fragmentType,
        args: isCreateQuery(path) && queryArgs,
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
          const {stringAccumulator, litAccumulator} = razorData.print()
          const graphqlOutput = t.templateLiteral(
            stringAccumulator.map(str =>
              t.templateElement({raw: str, cooked: str}),
            ),
            litAccumulator.map(lit => {
              if (lit.isFragment)
                // we tagged this inside BladeData
                return t.callExpression(lit, [
                  t.stringLiteral(getSimpleFragmentName(lit)),
                ])
              return lit || t.nullLiteral()
            }),
          )
          if (razorData._type === 'fragment') {
            razor.replaceWith(
              t.arrowFunctionExpression(
                [t.identifier(identifier)],
                graphqlOutput,
              ),
            )
          } else razor.replaceWith(graphqlOutput)
        }
      })
    }
  }
}

function parseBlade(path, id, razorData, slice = 0) {
  let refs = path.scope.bindings[id] && path.scope.bindings[id].referencePaths
  // console.log('parseblade', { refs, id, razorData, path });
  if (slice) refs = refs.slice(slice)
  if (refs && refs.length > 0) {
    // there has been an assignment and it has been used
    refs.forEach(blade => {
      processReference(blade, razorData)
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

// this is a hacky dodge but it will work for now
// these properties will just all be ignored by us
// (untested) destructure if your graphql field is really named one of these
const arrayPrototype = [
  'length',
  'copyWithin',
  'fill',
  'pop',
  'push',
  'reverse',
  'shift',
  'unshift',
  'sort',
  'splice',
  'concat',
  'includes',
  'indexOf',
  'join',
  'lastIndexOf',
  'slice',
  'toSource',
  'toString',
  'toLocaleString',
  'entries',
  'every',
  'filter',
  'find',
  'findIndex',
  'forEach',
  'keys',
  'map',
  'reduce',
  'reduceRight',
  'some',
  'values',
]

function processReference(blade, razorData) {
  if (
    blade.parentPath.isLogicalExpression() ||
    blade.parentPath.isIfStatement()
  )
    return // naked reference, nothing interesting here

  let LHS, RHS

  /***** processReference: PROCESS LHS *****/
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

  /* eslint-disable-next-line */
  function processLHS(ctx) {
    // if it is an object destructure, push and recurse
    const lhs = []
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
    // eslint-disable-next-line
    console.log('please examine this', ctx)
  }

  /***** processReference: PROCESS RHS *****/

  // doing this just to read chained objects (eg foo.bar.baz)
  // from left to right instead of
  // babel AST which makes us read from right to left
  RHS = []
  const RHSVisitor = {
    MemberExpression(childpath) {
      let aliasPath, calleeArguments
      if (isCallee(childpath)) {
        // if its a callee, extract its args and push it into RHS
        // will parse out fragments/args/directives later
        calleeArguments = getCalleeArgs(childpath)
        aliasPath = childpath
      }
      // hacky dodge for array methods; just ignores them for now
      // we will have to make iteration methods also count as blades
      for (const prop of arrayPrototype) {
        if (childpath.node.property.name === prop) return
      }
      if (childpath.parentKey !== 'arguments')
        // else it will include membexps inside call arguments
        RHS.push({
          name: childpath.node.property.name,
          calleeArguments,
          aliasPath,
        })
    },
  }
  if (ctx) {
    ctx.traverse(RHSVisitor)
  } else {
    // even if there is no assignment, still need to traverse the kids
    blade.findParent(ppath => !ppath.isMemberExpression()).traverse(RHSVisitor)
  }
  RHS = RHS.reverse() // annoying bc of how the AST works

  // pretty good place for debugging
  // console.log('bbb', { ctx, blade, LHS, RHS });

  /***** processReference: MERGE LHS AND RHS *****/

  // MERGE RHS FIRST: rhs.foreach - call add, return child, call add again
  let currentData = razorData
  RHS.forEach(({calleeArguments, name, aliasPath}) => {
    const args = []
    const fragments = []
    const directives = []

    if (calleeArguments) {
      for (const x of calleeArguments) {
        if (x.type === 'StringLiteral' || x.type === 'TemplateLiteral') {
          // its an arg or a directive; peek at first character to decide
          const peek = x.quasis ? x.quasis[0].value.raw[0] : x.value[0]
          peek === '@' ? directives.push(x) : args.push(x)
        } else {
          // its a fragment
          fragments.push(x)
        }
      }
    }

    currentData = currentData.add({
      name,
      args,
      directives,
      fragments,
    })
    if (currentData._args && aliasPath)
      aliasPath.parentPath.replaceWith(aliasPath)
    if (currentData._alias && aliasPath)
      aliasPath.node.property.name = currentData._alias
  })

  // MERGE LHS second: lhs.foreach
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

  /***** processReference: DONE *****/
}
