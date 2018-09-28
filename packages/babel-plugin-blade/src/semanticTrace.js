const arrayPrototypeEnables = {
  map: 1, // not 0 based as we will do null check against this
  every: 1,
  filter: 1,
  find: 1,
  findIndex: 1,
  forEach: 1,
  reduce: 2, // so we dont touch the accumulator - may be issue in future
  reduceRight: 2,
  some: 1,
}
const arrayPrototypeIgnores = [
  'length',
  'copyWithin',
  'fill',
  'pop', // TODO: may want to revisit
  'push',
  'reverse',
  'shift', // TODO: may want to revisit
  'unshift',
  'sort', // TODO: may want to revisit
  'splice',
  'concat',
  'includes',
  'indexOf',
  'join',
  'lastIndexOf',
  'slice',
  'toSource', // WARNING PROBABLY DONT USE
  'toString',
  'toLocaleString',
  'entries', // TODO: may want to revisit
  'every', // ENABLED
  'filter', // ENABLED
  'find', // ENABLED
  'findIndex', // ENABLED
  'forEach', // ENABLED
  'keys',
  'map', // ENABLED
  'reduce', // ENABLED
  'reduceRight', // ENABLED
  'some', // ENABLED
  'values', // TODO: may want to revisit
]

// eslint-disable-next-line
export function semanticTrace(
  referencePath,
  origin,
  semanticVisitor,
  semanticPath = [],
) {
  const refs = referencePath.scope.bindings[origin].referencePaths.filter(
    ref => ref.parent !== referencePath.parent,
  )
  // console.log('==', {origin, refs, semanticVisitor})
  refs.forEach(ref => {
    const [newRef, newSemanticPath, hasHitArrayMethod] = traceRHS(
      ref,
      semanticPath,
      semanticVisitor,
    )
    if (!hasHitArrayMethod) traceLHS(newRef, newSemanticPath, semanticVisitor)
  })
  conditionalCall(semanticVisitor, 'default', semanticPath)
}

function traceLHS(topRef, topSemanticPath, semanticVisitor) {
  const topPointer = topRef
  const newTopSemanticPath = [...topSemanticPath]
  if (topPointer.parentPath.type === 'VariableDeclarator') {
    const LHS = topPointer.parentPath.get('id')
    parseObjectPattern(LHS, newTopSemanticPath)
  }

  // hoisted up
  function parseObjectPattern(ref, semanticPath) {
    /* --- we do conCall but the semanticVisitor should ideally perform no actions apart from rename  */
    conditionalCall(semanticVisitor, ref.type, 'LHS', ref, semanticPath)
    /* --- we do conCall but should have no actions performed on it  */
    if (ref.type === 'ObjectPattern') {
      const properties = ref.get('properties')
      properties.forEach(property => {
        const newSemanticPath = [...semanticPath]
        const key = property.get('key')
        newSemanticPath.push([key.node.name, property])
        const value = property.get('value')
        parseObjectPattern(value, newSemanticPath)
      })
    } else if (ref.type === 'Identifier') {
      const idname = ref.get('name')
      semanticTrace(ref, idname.node, semanticVisitor, semanticPath)
    }
  }
}

function traceRHS(ref, semanticPath, topSemanticVisitor) {
  let topPointer = ref
  const newTopSemanticPath = [...semanticPath]
  let hasHitArrayMethod = false

  while (isValidRHSParent(topPointer)) {
    topPointer = topPointer.parentPath
    workOnRHSParent(topPointer, newTopSemanticPath, topSemanticVisitor)
  }
  return [topPointer, newTopSemanticPath, hasHitArrayMethod]

  // hoisted up
  function isValidRHSParent(ptr) {
    const baseLayer = ['Member', 'Call']
      .map(x => `${x}Expression`)
      .includes(ptr.parentPath.type)
    const validGrandParent =
      ptr.parentPath.parentPath.type !== 'ExpressionStatement'
    return baseLayer && validGrandParent && !hasHitArrayMethod
  }

  // hoisted up
  function workOnRHSParent(ptr, newSemanticPath, semanticVisitor) {
    if (ptr.type === 'MemberExpression') {
      const newPath = ptr.node.property.name
      if (arrayPrototypeIgnores.includes(newPath)) {
        hasHitArrayMethod = true
        if (
          arrayPrototypeEnables[newPath] &&
          isValidArrayPrototypeInternal(ptr)
        ) {
          const internalFunctionIndex = arrayPrototypeEnables[newPath]
          const internalFunction = ptr.parentPath.get('arguments')[0] // arrow fn
          const paramRef = internalFunction.get('params')[
            internalFunctionIndex - 1
          ] // 1-indexed param just to make it null checkable
          semanticTrace(
            paramRef,
            paramRef.get('name').node,
            semanticVisitor,
            newSemanticPath,
          )
        }
      } else {
        newSemanticPath.push([newPath, ptr])
        //        const parent = ptr.parentPath
        //        conditionalCall(semanticVisitor, parent.type, 'RHS', parent, newSemanticPath)
        conditionalCall(semanticVisitor, ptr.type, 'RHS', ptr, newSemanticPath)
      }
    }

    // will be hoisting up
    function isValidArrayPrototypeInternal(myptr) {
      const isValidParent = myptr.parentPath.type === 'CallExpression'
      // swyx: TODO: we'll probably have to support normal functions here too
      const isArrowChild =
        myptr.parentPath.get('arguments')[0].type === 'ArrowFunctionExpression'
      return isValidParent && isArrowChild
    }
  }
}

function conditionalCall(visitor, key, ...args) {
  if (visitor[key]) visitor[key](...args)
}
