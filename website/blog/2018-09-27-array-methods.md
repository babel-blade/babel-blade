---
title: Array Methods
author: swyx
authorURL: http://twitter.com/swyx
authorImageURL: https://pbs.twimg.com/profile_images/990728399873232896/CMPn3IxT_400x400.jpg
---

so to handle array prototypes i theoretically need to go and reimplement [the entire Array.prototype](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/prototype) spec. however i just dont have time for that right now and it is likely not going to be that useful. so what i can do is have an Ignore list and a special Enabled List where I manually make sure that the blade is passed through to the internal inline function.

The ignore list i am working with is:

```js
const arrayPrototypeIgnores = [
  "length",
  "copyWithin",
  "fill",
  "pop",
  "push",
  "reverse",
  "shift",
  "unshift",
  "sort",
  "splice",
  "concat",
  "includes",
  "indexOf",
  "join",
  "lastIndexOf",
  "slice",
  "toSource",
  "toString",
  "toLocaleString",
  "entries",
  "every",
  "filter",
  "find",
  "findIndex",
  "forEach",
  "keys",
  "map",
  "reduce",
  "reduceRight",
  "some",
  "values"
];
```

and I will just work on enabling `map` as it will probably be a good example for the rest.

---

the first observation i make is that the array prototype method problem is a RHS one so i can just zoom in on that part of the code.

once an array prototype method is used, the LHS is no longer useful to us so i need to also block that LHS parsing.

---

## hasHitArrayMethod

I ended up implementing using a dirty flag:

```js
refs.forEach(ref => {
  let [newRef, newSemanticPath, hasHitArrayMethod] = TraceRHS(
    ref,
    semanticPath,
    semanticVisitor
  );
  if (!hasHitArrayMethod) TraceLHS(newRef, newSemanticPath, semanticVisitor);
});
```

and then inside RHS:

```js
function TraceRHS(ref, semanticPath, semanticVisitor) {
  let ptr = ref;
  let newSemanticPath = [...semanticPath];
  let hasHitArrayMethod = false;

  while (isValidRHSParent(ptr)) {
    ptr = ptr.parentPath;
    workOnRHSParent(ptr, newSemanticPath, semanticVisitor);
  }
  return [ptr, newSemanticPath, hasHitArrayMethod];

  // hoisted up
  function isValidRHSParent(ptr) {
    const baseLayer = ["Member", "Call"]
      .map(x => x + "Expression")
      .includes(ptr.parentPath.type);
    const validGrandParent =
      ptr.parentPath.parentPath.type != "ExpressionStatement";
    return baseLayer && validGrandParent && !hasHitArrayMethod;
  }

  // hoisted up
  function workOnRHSParent(ptr, newSemanticPath, semanticVisitor) {
    if (ptr.type === "MemberExpression") {
      const newPath = ptr.node.property.name;
      if (arrayPrototypeIgnores.includes(newPath)) {
        hasHitArrayMethod = true;
        if (
          arrayPrototypeEnables[newPath] &&
          isValidArrayPrototypeInternal(ptr)
        ) {
          const internalFunctionIndex = arrayPrototypeEnables[newPath];
          const internalFunction = ptr.parentPath.get("arguments")[0]; // arrow fn
          const paramRef = internalFunction.get("params")[
            internalFunctionIndex - 1
          ]; // 1-indexed param just to make it null checkable
          semanticTrace(
            paramRef,
            paramRef.get("name").node,
            semanticVisitor,
            newSemanticPath
          );
        }
      } else {
        newSemanticPath.push(newPath);
        const parent = ptr.parentPath;
        conditionalCall(
          semanticVisitor,
          parent.type,
          "RHS",
          parent,
          newSemanticPath
        );
      }
    }

    // will be hoisting up
    function isValidArrayPrototypeInternal(ptr) {
      const isValidParent = ptr.parentPath.type === "CallExpression";
      const isArrowChild =
        ptr.parentPath.get("arguments")[0].type === "ArrowFunctionExpression";
      return isValidParent && isArrowChild;
    }
  }
}
```

so LHS gets short circuited as does RHS post an array method call.

current state: https://latest.astexplorer.net/#/gist/01983f61e310f1eaf6b12a221556a937/adec3bd3874c7c28df5f648bea71733ee52b37ef

---

## final prep before integrating babel-blade

now we clean up all the console logs, and do some manipulation to see what happens.

ok that was a success.. heres a simple replacement:

```js
const semanticVisitor = {
  default(...args) {
    console.log("[debugging callback]", ...args);
  },
  CallExpression(...args) {
    const [hand, ref, semPath, ...rest] = args;
    const callee = ref.get("callee");
    console.log("CallExpression", hand, semPath, ref, callee);
    ref.replaceWith(callee);
  },
  VariableDeclarator(...args) {
    console.log("VariableDeclarator", ...args);
  },
  ArrowFunctionExpression(...args) {
    console.log("ArrowFunctionExpression", ...args);
  }
};
```

it turns `abc.foo('@test','poo').foo1` into `abc.foo.foo1`.

now i have to integrate the rest of the thingy.

https://latest.astexplorer.net/#/gist/01983f61e310f1eaf6b12a221556a937/4ec4d2ebbcbaca04be21435930a1b4dddd2421f7

---

ok that was tricky but wasnt too bad. i have a working reconstituted babel-blade!

inside of `handleCreateRazor` i now use:

```js
refs.forEach(razor => {
  // define visitor
  const semanticVisitor = {
    default(...args) {
      console.log("[debugging callback]", ...args);
    },
    CallExpression(...args) {
      const [hand, ref, semPath, ...rest] = args;
      const callee = ref.get("callee");
      console.log("CallExpression", hand, semPath, ref, callee);
      ref.replaceWith(callee);
    },
    MemberExpression(...args) {
      const [hand, ref, semPath, ...rest] = args;
      console.log("MemberExpression", hand, semPath, ref);
      let currentRazor = razorData;
      semPath.forEach(chunk => {
        currentRazor = currentRazor.add({ name: chunk });
      });
    },
    VariableDeclarator(...args) {
      console.log("VariableDeclarator", ...args);
    },
    ArrowFunctionExpression(...args) {
      console.log("ArrowFunctionExpression", ...args);
    }
  };
  // go through all razors
  if (isCallee(razor)) {
    // we have been activated! time to make a blade!
    razorID = getAssignTarget(razor);
    // clear the reference
    if (razor.container.arguments[0])
      razor.parentPath.replaceWith(razor.container.arguments[0]);
    else razor.parentPath.remove();
    // parseBlade(razor, razorID, razorData)
    semanticTrace(razor, razorID, semanticVisitor);
  }
});
```

phew. https://latest.astexplorer.net/#/gist/01983f61e310f1eaf6b12a221556a937/213eda76de287dffef1fb899596e8c89262fa422

now this does the basic macro example:

```js
import { Connect, query } from "urql";
import { createQuery } from "blade.macro";

const movieQuery = createQuery("$id: id");
const Movie = ({ id, onClose }) => (
  <div>
    <Connect
      query={query(movieQuery, { id: id })}
      children={({ data }) => {
        const DATA = movieQuery(data);
        return (
          <div>
            <h2>{DATA.movie.gorilla}</h2>
            <p>{DATA.movie.monkey}</p>
            <p>{DATA.chimp}</p>
          </div>
        );
      }}
    />
  </div>
);
```

and produces

```js
import { Connect, query } from "urql";

const Movie = ({ id, onClose }) => (
  <div>
    <Connect
      query={query(
        `
query movieQuery($id: id){
  movie {
    gorilla
    monkey
  }
  chimp
}`,
        {
          id: id
        }
      )}
      children={({ data }) => {
        const DATA = data;
        return (
          <div>
            <h2>{DATA.movie.gorilla}</h2>
            <p>{DATA.movie.monkey}</p>
            <p>{DATA.chimp}</p>
          </div>
        );
      }}
    />
  </div>
);
```

---

## child alias comparison

i used to have this bit of code inside my datastructure:

```js
  add(val) {
    let child = this.get(val.name)
    // eslint-disable-next-line
    if (child && child._alias == val.alias) {
      // intentional == here
      // child = child;
    } else {
      child = new BladeData(val)
      this._children.push(child)
    }
    return child // return child so that more operations can be made
  }
```

for both my razor and blade and this was important for an "idempotent add" to the children. i could call `.add(chilData)` repeatedly and there would be no extra children if their details matched up.

however this bit: `child._alias == val.alias` was screwing me up, i couldnt find out why i had put it in there. since i no longer have `val.alias` it is screwing up my idempotence. so i removed it. i have no idea if i will regret that but now i have working aliasing.

---

## Deferred execution with Map()

So babel-blade does two passes - one pass reads in the data, and the next outputs the data. in particular, the output of the data modifies the AST to inject the graphql string as well as rename babel-blade inline function calls with aliases. it is this alias renaming that caused me some grief, because without it i can actually do one pass of the script since the graphql string injection doesnt really affect any other part of the AST.

this is my old notes on the babel strategy:

```
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
```

In short, I used to do this:

- read blades into an LHS and RHS queue
- pop off the queue:
  - add into my datastructure (Razors and Blades)
  - rename aliases if necessary
- once queues are depleted, inject graphql

Now i do this

- declare an `aliasReplaceQueue` which is a `Map()`
- semanticTraverse entire AST
  - read into datastructure
  - where renaming will be needed, push the node into `aliasReplaceQueue`
- inject graphql
- `aliasReplaceQueue.forEach` and rename

This seems like a much nicer approach (no separate lhs and rhs queues). with Map I get deduplication of nodes for free.

---

## having confidence in prior work

i had another gnarly bug which i could not trace. the only message was `Cannot read property '0' of null`.

this is inside ASTexplorer where there is no real stepping through of code. the `debugger` statement is useful but only so useful when you have 600 lines of recursive code. you still need to know where to put it.

it got to a point where i started doubting the wrong piece of code, my `print` code for printing out the graphql query string (specifically, for fragments). i knew that this was battle tested from prior work, however I could make the error go away just by making this one tiny change that hopefully wouldnt cascade down. of course i made the change, and of course the error wasn't solved - it just flowed down to another test case where my fix was now the bug.

so i spent about 1-2 hours trying to fix both my bug and the bug that my fix caused and that is a hopeless task. eventually i decided to double check my hypothesis of what the bug really was, and did even more logging and tracing. this is how i eventually tracked it down to a totally different part of the code (the aliasReplaceQueue removal above) and solved it with just a simple conditional.

the lesson i guess is dont be so quick to suspect your prior work. if the fundamental assumptions havent changed, its more likely to be your new code that is buggy, than the old code.

---

## woohoo

so i am basically done. i should stop here and clean up the code and work on my vscode extension as well as slide deck.

the last thing i wanna add is the array methods. so lets do this.

(later) ok i enabled some more methods:

```js
const arrayPrototypeEnables = {
  map: 1, // not 0 based as we will do null check against this
  every: 1,
  filter: 1,
  find: 1,
  findIndex: 1,
  forEach: 1,
  reduce: 2, // so we dont touch the accumulator - may be issue in future
  reduceRight: 2,
  some: 1
};
```

---

## problem with multiple aliases

my words come back to bite me. i modified my own code above (see "child alias comparison") and found the use case why i had them there originally:

```js
const DATA = movieQuery(data);
const film1 = DATA.movie("id: 1");
const film2 = DATA.movie("id: 2");
const nestedQuery = film2.actors;
```

so now i have to revert the change and re explore how to make this alias actually work.

I discovered this through standalone tests i wrote for my datastructure, which is great news.

current (buggy) work: https://latest.astexplorer.net/#/gist/01983f61e310f1eaf6b12a221556a937/86fda064021f44f3627affe8e863d4a388c6ce36

(later) I fixed it due to some extensive before-after logging. dont ask but anyway here was the solution:

```js
  add(val) {
    let preferredNameOrAlias = val.args ? hashArgs(val.args, val.name) : val.name
    let child = this.get(preferredNameOrAlias)
    // eslint-disable-next-line
    if (child && child._alias == hashArgs(val.args, val.name)) {
      // intentional == here
      // child = child;
    } else {
      console.log('adding new child ', val.name, 'because',
                  child && child._alias, 'vs', hashArgs(val.args, val.name))
      child = new BladeData(val)
      this._children.push(child)
    }
    return child // return child so that more operations can be made
  }
```

with `hashArgs` extracted as:

```js
function hashArgs(args, name) {
  return args.length ? `${name}_${hashCode(JSON.stringify(args))}` : null;
}
```

so that i could undo some hacky shit i was doing earlier just to avoid it.

---

## new bug with destrcuturing

this is very worrying - in my testing i found a new bug:

`const {monkey, title} = DATA.movie('id: movieID')`

the LHS destructuring wasn't detecting at all! not good.

(later) i fixed it by removing semanticVisitor logic to a `idempotentAddToRazorData` function and calling it on BOTH Identifiers and MemberExpressions.

https://latest.astexplorer.net/#/gist/01983f61e310f1eaf6b12a221556a937/16e00bd236a565b6d5a0ffd7febbe18e694b5f6d

and with that, all tests pass :)

---

## my work as it stands today (600ish lines):

```js
module.exports = createMacro(bladeMacro);

function bladeMacro({ references, state, babel: { types: t } }) {
	const { JSXMacro = [], default: defaultImport = [], createQuery, createFragment } = references;
	[...createFragment, ...createQuery]
      .forEach(referencePath => handleCreateRazor(referencePath, t));
}

export function handleCreateRazor(path, t) {
  if (isCreateQuery(path) || isCreateFragment(path)) {
    // get the identifier and available args
    const identifier = getAssignTarget(path)
    let queryArgs
    if (isCallee(path)) queryArgs = getCalleeArgs(path)
    // traverse scope for identifier references
    const refs = path.scope.bindings[identifier].referencePaths
    // clear the reference
    path.findParent(ppath => ppath.isVariableDeclaration()).remove()
    let aliasReplaceQueue = new Map() // we will defer alias replacement til all semantic traversals are done
    if (refs.length > 0) {
      let razorID = null
      if (isCreateFragment(path) && !queryArgs[0]) throw new Error('createFragment must have one argument to specify the graphql type they are on')
      const fragmentType =
        isCreateFragment(path) && maybeGetSimpleString(queryArgs[0]) //getFragmentName(path)
      const queryType = isCreateFragment(path) ? 'fragment' : 'query'
      const razorData = new RazorData({
        type: queryType,
        name: isCreateFragment(path) ? t.Identifier(identifier) : identifier,
        fragmentType,
        args: isCreateQuery(path) && queryArgs,
      })
      
      function idempotentAddToRazorData(semPath) {
        let currentRazor = razorData
        semPath.forEach(([name, ref]) => {
          let aliasPath, calleeArguments
          if (isCallee(ref)) {
            // if its a callee, extract its args and push it into RHS
            // will parse out fragments/args/directives later
            calleeArguments = getCalleeArgs(ref)
            aliasPath = ref
          }
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
          // const mockRazorToGetAlias = new BladeData({name, args}) // this is hacky, i know; a result of the datastructures being legacy
          /*
          console.log('b4',{name, 
                           args: args.length && args[0].value, 
                           currentRazor: [...currentRazor._children],
                           razorData: [...razorData._children],
                          })
          */
          currentRazor = currentRazor.add({
            name,
            args,
            directives,
            fragments,
          })
          /*
          console.log('aftr',{
                           currentRazor: [...currentRazor._children],
                           razorData: [...razorData._children],
                          })
          */
          //if (currentRazor._args && aliasPath) aliasPath.parentPath.replaceWith(aliasPath)
          //if (currentRazor._alias && aliasPath) aliasPath.node.property.name = currentRazor._alias

          if (currentRazor._args && aliasPath) { 
            aliasReplaceQueue.set(aliasPath, currentRazor)
          }
        })
      }
      
      refs.forEach(razor => {
        // define visitor
        const semanticVisitor = {
          CallExpression(...args){
            const [hand, ref, semPath, ...rest] = args
            const callee = ref.get('callee')
            // console.log('CallExpression', hand, semPath, ref,callee)
            ref.replaceWith(callee)
          },
          Identifier(...args){
            const [hand, ref, semPath, ...rest] = args
            // console.log('Identifier', hand, semPath, ref)
            if (hand === 'origin') idempotentAddToRazorData(semPath)
          },
          MemberExpression(...topargs){
            const [hand, ref, semPath, ...rest] = topargs
            // console.log('MemberExpression', hand, semPath, ref)
            idempotentAddToRazorData(semPath)
          },
          /*
          default(...args){
            console.log('[debugging callback]', ...args)
          },
          VariableDeclarator(...args){
            console.log('VariableDeclarator', ...args)
          },
          ArrowFunctionExpression(...args){
            console.log('ArrowFunctionExpression', ...args)
          }
          */
        }
        // go through all razors
        if (isCallee(razor)) {
          // we have been activated! time to make a blade!
          razorID = getAssignTarget(razor)
          // clear the reference
          if (razor.container.arguments[0])
            razor.parentPath.replaceWith(razor.container.arguments[0])
          else razor.parentPath.remove()
          // extract data
          semanticTrace(razor, razorID, semanticVisitor)
        }
      })
      
      // REALLY GOOD PLACE TO LOG IN CASE THE SEMANTICTRAVERSAL IS WEIRD
      //console.log({razorData})
      // STAGE ONE DONE! NOW TO insert query
      refs.forEach(razor => {
        if (!isObject(razor)) {
          const {stringAccumulator, litAccumulator} = razorData.print()
          const graphqlOutput = t.templateLiteral(
            stringAccumulator.map(str => t.templateElement({raw: str, cooked: str})),
            litAccumulator.map(lit => {
              if (lit.isFragment) {
                // we tagged this inside BladeData
                return t.callExpression(lit, [
                  t.stringLiteral(getSimpleFragmentName(lit)),
                ])
              }
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
    aliasReplaceQueue.forEach((currentRazor, aliasPath) => {
      if (currentRazor._alias) {
        aliasPath.parentPath.replaceWith(aliasPath)
        aliasPath.node.property.name = currentRazor._alias
      }
    })
  }
}



/* here is the source of the semanticTrace utility */


const arrayPrototypeEnables = {
  map: 1, // not 0 based as we will do null check against this
  every: 1,
  filter: 1,
  find: 1,
  findIndex: 1,
  forEach: 1,
  reduce: 2, // so we dont touch the accumulator - may be issue in future
  reduceRight: 2,
  some: 1
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
  'sort',  // TODO: may want to revisit
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



function semanticTrace(referencePath, origin, semanticVisitor, semanticPath = []) {
  const refs = referencePath.scope.bindings[origin].referencePaths
  					.filter(ref => ref.parent != referencePath.parent)
  // console.log('==', {origin, refs, semanticVisitor})
  conditionalCall(semanticVisitor, referencePath.type, 'origin', referencePath, semanticPath)  
  refs.forEach(ref => {
    let [newRef, newSemanticPath, hasHitArrayMethod] = TraceRHS(ref, semanticPath, semanticVisitor)
    if (!hasHitArrayMethod) TraceLHS(newRef, newSemanticPath, semanticVisitor)
  })
  conditionalCall(semanticVisitor,'default',semanticPath)
}



function TraceLHS(ref, semanticPath, semanticVisitor) {
  let ptr = ref
  let newSemanticPath = [...semanticPath]
  if (ptr.parentPath.type === 'VariableDeclarator') {
    const LHS = ptr.parentPath.get('id')
    parseObjectPattern(LHS, newSemanticPath)
  }
  
  // hoisted up
  function parseObjectPattern(ref, semanticPath) {
    /* --- we do conCall but the semanticVisitor should ideally perform no actions apart from rename  */
    conditionalCall(semanticVisitor, ref.type, 'LHS', ref, semanticPath)
    /* --- we do conCall but should have no actions performed on it  */
    if (ref.type === 'ObjectPattern') {
      const properties = ref.get('properties')
      properties.forEach(property => {
	    let newSemanticPath = [...semanticPath]
        const key = property.get('key')
        newSemanticPath.push([key.node.name, property])
        const value = property.get('value')
        parseObjectPattern(value, newSemanticPath)
      })
    } else if  (ref.type === 'Identifier') {
      const idname = ref.get('name')
      semanticTrace(ref, idname.node, semanticVisitor, semanticPath)
    }
  }
}

function TraceRHS(ref, semanticPath, semanticVisitor) {
  let ptr = ref
  let newSemanticPath = [...semanticPath]
  let hasHitArrayMethod = false
  
  while (isValidRHSParent(ptr)) {
    ptr = ptr.parentPath
    workOnRHSParent(ptr, newSemanticPath, semanticVisitor)
  }
  return [ptr, newSemanticPath, hasHitArrayMethod]
  
  // hoisted up
  function isValidRHSParent(ptr) {
    const baseLayer = ["Member", "Call"]
      .map(x => x + "Expression")
      .includes(ptr.parentPath.type)
    const validGrandParent = ptr.parentPath.parentPath.type != "ExpressionStatement"
    return baseLayer && validGrandParent && !hasHitArrayMethod
  }
  
  // hoisted up
  function workOnRHSParent(ptr, newSemanticPath, semanticVisitor) {
    if (ptr.type === "MemberExpression") {
      const newPath = ptr.node.property.name
      if (arrayPrototypeIgnores.includes(newPath)) {
        hasHitArrayMethod = true
        if (arrayPrototypeEnables[newPath] && isValidArrayPrototypeInternal(ptr)) {
          const internalFunctionIndex = arrayPrototypeEnables[newPath]
          const internalFunction = ptr.parentPath.get('arguments')[0] // arrow fn
          const paramRef = internalFunction.get('params')[internalFunctionIndex - 1] // 1-indexed param just to make it null checkable
          semanticTrace(paramRef, paramRef.get('name').node, semanticVisitor, newSemanticPath)
        }
      } else {
        newSemanticPath.push([newPath, ptr])
//        const parent = ptr.parentPath
//        conditionalCall(semanticVisitor, parent.type, 'RHS', parent, newSemanticPath)
        conditionalCall(semanticVisitor, ptr.type, 'RHS', ptr, newSemanticPath)
      }
    } 
    
    // will be hoisting up
    function isValidArrayPrototypeInternal(ptr) {
      const isValidParent = ptr.parentPath.type === 'CallExpression'
      // swyx: TODO: we'll probably have to support normal functions here too
      const isArrowChild = ptr.parentPath.get('arguments')[0].type === "ArrowFunctionExpression"
      return isValidParent && isArrowChild
    }
  }
}

function conditionalCall(visitor, key, ...args) {
  if (visitor[key]) visitor[key](...args)
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
    : undefined;
}

function getObjectPropertyName(path) {
  return path.container.property ? path.container.property.name : undefined;
}

// potentially useful function from devon to extract a colocated fragment's name
function getFragmentName(path) {
  // console.log('getfragname', { path });
  if (
    path.parentPath.isAssignmentExpression() &&
    path.parent.left.type === 'MemberExpression' &&
    path.parent.left.property.name === 'fragment'
  ) {
    const name = path.parent.left.object.name;
    return name[0].toLowerCase() + name.slice(1) + 'Fragment';
  }
  return null;
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

function isObject(path) {
  return looksLike(path, { key: 'object' });
}

function getCalleeArgs(calleePath) {
  const arg = calleePath.container.arguments;
  return arg;
}

function isCallee(path) {
  const parent = path.parentPath;
  return parent.isCallExpression() && path.node === parent.node.callee;
}

function isCreateQuery(path) {
  return looksLike(path, { node: { name: 'createQuery' } });
}
function isCreateFragment(path) {
  return looksLike(path, { node: { name: 'createFragment' } });
}

function getSimpleFragmentName(frag) {
  return `${frag.object.name}${frag.property.name}`
}
function isPropertyCall(path, name) {
  return looksLike(path, {
    node: {
      type: 'CallExpression',
      callee: {
        property: { name },
      },
    },
  });
}

function looksLike(a, b) {
  return (
    a &&
    b &&
    Object.keys(b).every(bKey => {
      const bVal = b[bKey];
      const aVal = a[bKey];
      if (typeof bVal === 'function') {
        return bVal(aVal);
      }
      return isPrimitive(bVal) ? bVal === aVal : looksLike(aVal, bVal);
    })
  );
}

function isPrimitive(val) {
  // eslint-disable-next-line
  return val == null || /^[sbn]/.test(typeof val);
}



/****
 *
 * DATASTRUCTURES.JS
 *
 */


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
    let preferredNameOrAlias = val.args && val.args.length ? hashArgs(val.args, val.name) : val.name
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
    }
    else { // have to make fragment name parametric
      TemplateLiteral.addStr(`\nfragment `)
      TemplateLiteral.addLit(this._name)
      TemplateLiteral.addStr(` on ${this._fragmentType}`)
    }
    TemplateLiteral
      .addStr(maybeArgs ? '(' : '')
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
    // if (child && child._alias == val.alias) { // intentional ==
    if (child && child._alias == hashArgs(val.args, val.name)) {
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
        if (i!==0) TemplateLiteral.addStr(', ')
        TemplateLiteral.addLit(arg)
      })
    }
    TemplateLiteral
      .addStr(maybeArgs ? ')' : '')
    if (maybeDirs) {
      TemplateLiteral.addStr(' ')
      maybeDirs.forEach((dir, i) => {
        if (i!==0) TemplateLiteral.addStr(' ')
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
  return  args.length 
      ? `${name}_${hashCode(JSON.stringify(args))}` : null
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


```
