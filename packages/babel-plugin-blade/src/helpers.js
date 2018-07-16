module.exports = {
  isPropertyCall,
  looksLike,
  isObject,
  isCallee,
  isCreateQuery,
  isCreateFragment,
  getAssignTarget,
  getObjectPropertyName,
  getCalleeArgs,
  maybeGetSimpleString,
}

/****
 *
 * HELPERS.JS
 * Simple readable utils for navigating the path,
 * pure functions w no significant logic
 *
 */

function getAssignTarget(path) {
  return path.parentPath.container.id
    ? path.parentPath.container.id.name
    : undefined
}

function getObjectPropertyName(path) {
  return path.container.property ? path.container.property.name : undefined
}

// potentially useful function from devon to extract a colocated fragment's name
function getFragmentName(path) {
  // console.log('getfragname', { path });
  if (
    path.parentPath.isAssignmentExpression() &&
    path.parent.left.type === 'MemberExpression' &&
    path.parent.left.property.name === 'fragment'
  ) {
    const name = path.parent.left.object.name
    return name[0].toLowerCase() + name.slice(1) + 'Fragment'
  }
  return null
}

function isObject(path) {
  return looksLike(path, {key: 'object'})
}

function getCalleeArgs(calleePath) {
  const arg = calleePath.container.arguments
  return arg
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

function isPropertyCall(path, name) {
  return looksLike(path, {
    node: {
      type: 'CallExpression',
      callee: {
        property: {name},
      },
    },
  })
}

function maybeGetSimpleString(Literal) {
  if (Literal.type === 'StringLiteral') return Literal.value
  if (
    Literal.type === 'TemplateLiteral' &&
    !Literal.expressions.length &&
    Literal.quasis.length === 1
  )
    return Literal.quasis[0].value.raw
  // else
  return null
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

/*
eslint
  complexity: ["error", 8],
  import/no-unassigned-import: "off",
  import/no-dynamic-require: "off",
*/
