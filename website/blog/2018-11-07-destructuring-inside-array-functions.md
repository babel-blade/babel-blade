---
title: destructuring inside array functions
author: swyx
authorURL: http://twitter.com/swyx
authorImageURL: https://pbs.twimg.com/profile_images/990728399873232896/CMPn3IxT_400x400.jpg
---

interest in babel-blade is randomly heating up again (graphql summit is in town, but i dont think i did anything to promote it or anything)

Kent tried it out and came to me with this:

> You know, if you need to enforce some limitations on what I can do to get my values out of arrays that's fine too
> Like if you have to enforce that all array values must have a map that maps the array to the needed values or something that'd be fine with me

he was [trying to do this](https://astexplorer.net/#/gist/01983f61e310f1eaf6b12a221556a937/1ad986e53cc50774a079ce235f92d6b39269b62c):

```js
let result = pageQuery(data);
const stuff = result.stuff.map(({ a }) => ({ a }));
```

and it didnt work:

```js
`
query pageQuery{
  stuff {
    map_2248: map(${({ a }) => ({
      a
    })})
  }
}
`;
```

thats not right. basically i forgot/neglected to account for destructuring inside of array method internal functions.

also he was using an old astexplorer which didnt even have the map functions. because my docs were out of date. facepalm.

anyway, i fixed it by detecting destructuring inside `workOnRHSParent`:

```js
if (!newblade && paramRef.type === 'ObjectPattern') {
  // destructuring!
  // *******this is new*******
  parseObjectPattern(paramRef, newSemanticPath);
  // hoisted up
  function parseObjectPattern(ref, semanticPath) {
    /* --- we do conCall but the semanticVisitor should ideally perform no actions apart from rename  */
    conditionalCall(semanticVisitor, ref.type, 'LHS', ref, semanticPath);
    /* --- we do conCall but should have no actions performed on it  */
    if (ref.type === 'ObjectPattern') {
      const properties = ref.get('properties');
      properties.forEach(property => {
        const newSemanticPath = [...semanticPath];
        const key = property.get('key');
        newSemanticPath.push([key.node.name, property]);
        const value = property.get('value');
        parseObjectPattern(value, newSemanticPath);
      });
    } else if (ref.type === 'Identifier') {
      const idname = ref.get('name');
      semanticTrace(ref, idname.node, semanticVisitor, semanticPath);
    }
  }
  // *******this is new*******
} else {
  // kick off the traversal inside the internal function
  semanticTrace(paramRef, newblade, semanticVisitor, newSemanticPath);
}
```

however this is a complete cut and paste of what is already inside `TraceLHS`. However i was unable to extract it out due to a weird bug where i am shadowing a function. sigh. tech debt.

anyway now you can do this:

```js
let result = pageQuery(data);
const { temp } = result;
const stuff = result.stuff.map(({ a: { c }, b }) => ({ a }));
```

and get this:

```js
`
query pageQuery{
  temp {
    a {
      c
    }
    b
  }
}`;
```

---

i also made a minor fix to avoid number literals:

```js
const repositories = reposData.map(r => ({
  ...r.node,
  languages: undefined,
  stargazersCount: r.node.stargazers.totalCount,
  language: r.node.languages.edges[0]
    ? r.node.languages.edges[0].node.name
    : 'Unknown'
}));
```

the `[0]` is a `NumberLiteral`. so we just have to skip it:

```js
while (isValidRHSParent(ptr)) {
  ptr = ptr.parentPath;
  if (ptr.get('property').type !== 'NumericLiteral')
    // skip number acccess
    workOnRHSParent(ptr, newSemanticPath, semanticVisitor);
}
```

latest: https://astexplorer.net/#/gist/01983f61e310f1eaf6b12a221556a937/8f67afb00bebb5c8c0d7547d397f01d5ac74a16b

---

lastly i also have a TODO to make sure i account for `function () {}` as much as i do new school `() => {}`

oh wow it was SO SIMPLE. i just added regular functions!

```js
function isValidArrayPrototypeInternal(ptr) {
  const isValidParent = ptr.parentPath.type === 'CallExpression';
  const isArrowChild = [
    'ArrowFunctionExpression',
    'FunctionExpression'
  ].includes(ptr.parentPath.get('arguments')[0].type); // one line code change lol
  return isValidParent && isArrowChild;
}
```

latest: https://astexplorer.net/#/gist/01983f61e310f1eaf6b12a221556a937/c0480aa6b5f4188b88750464ef48256054fd7842

---

publishing v0.1.4: https://astexplorer.net/#/gist/01983f61e310f1eaf6b12a221556a937/b5d86dd28cd3e76390903bd514285af22251c184
