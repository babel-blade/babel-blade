---
title: Writing semanticVisitor
author: swyx
authorURL: http://twitter.com/swyx
authorImageURL: https://pbs.twimg.com/profile_images/990728399873232896/CMPn3IxT_400x400.jpg
---

Ok today I am doing work on semanticVisitor. i started out with [a bug in astexplorer](https://github.com/fkling/astexplorer/issues/345) but was able to recover with a local build.

## what I star with today

for a sample piece of JS like this:

```js
import { pseudoFunction } from "AnyNameThatEndsIn.macro";
var abc = {};
pseudoFunction(abc); // tags the object, disappears
console.log(2 + 3, abc);
const {
  child1: { child11: boop }
} = abc.foo.bar;
const { child2 } = boop.foo;
```

my parser looks like this:

```js
module.exports = createMacro(myMacro);

const trackVisitor = {};

function myMacro(props) {
  const { references, state, babel } = props;
  const {
    pseudoFunction = [],
    JSXMacro = [],
    default: defaultImport = []
  } = references;
  pseudoFunction.forEach(referencePath => {
    if (referencePath.parentPath.type === "CallExpression") {
      visitPseudoFunction(referencePath, trackVisitor, {
        references,
        state,
        babel
      });
    } else {
      console.log("invalid use of pseudofunction: ", referencePath);
    }
  });
}

function visitPseudoFunction(
  referencePath,
  visitor,
  { references, state, babel }
) {
  const tagged = referencePath.container.arguments[0].name;
  const scope = referencePath.scope.bindings[tagged].referencePaths.filter(
    ref => ref.parent != referencePath.parent
  );
  console.log({ a: referencePath, scope: scope });
}
```

the `trackVisitor` function is the one the blade implementor implements, but i think it is still doing too much work. time to revamp it.

---

## the game plan

the new plan is to only work based on identifier. if you pass `semanticTrace` an identifier (lets call it `origin`), it will go through all the semantic children in your scope and call your callback function. so `semanticTrace`'s job is to only pass you identifier nodes as well as a nice path down from your `origin` identifier.

alrighty then.

---

## the overarching function

so i implemented that:

```js
module.exports = createMacro(myMacro);

const semanticChildCallback = (...args) => {
  console.log("called", ...args);
};

function myMacro(props) {
  const { references, state, babel } = props;
  const {
    pseudoFunction = [],
    JSXMacro = [],
    default: defaultImport = []
  } = references;
  pseudoFunction.forEach(referencePath => {
    if (referencePath.parentPath.type === "CallExpression") {
      const origin = referencePath.container.arguments[0].name;
      semanticTrace(referencePath, origin, semanticChildCallback, props);
    } else {
      console.log("invalid use of pseudofunction: ", referencePath);
    }
  });
}

function semanticTrace(referencePath, origin, semanticChildCallback, props) {
  const refs = referencePath.scope.bindings[origin].referencePaths.filter(
    ref => ref.parent != referencePath.parent
  );
  console.log({ a: referencePath, origin, refs });
}
```

now i have `refs`. for each `ref`, i need to call `semanticChildCallback`, then travel up their node tree until i hit some end state, and then `semanticTrace` the new identifiers that result from that.

---

## working path tracer

ok i have a working path tracer:

```js
module.exports = createMacro(myMacro);

const semanticChildCallback = (...args) => {
  console.log("called", ...args);
};

function myMacro(props) {
  const { references, state, babel } = props;
  const {
    pseudoFunction = [],
    JSXMacro = [],
    default: defaultImport = []
  } = references;
  pseudoFunction.forEach(referencePath => {
    if (referencePath.parentPath.type === "CallExpression") {
      const origin = referencePath.container.arguments[0].name;
      semanticTrace(referencePath, origin, semanticChildCallback);
    } else {
      console.log("invalid use of pseudofunction: ", referencePath);
    }
  });
}

function semanticTrace(
  referencePath,
  origin,
  semanticChildCallback,
  semanticPath = []
) {
  const refs = referencePath.scope.bindings[origin].referencePaths.filter(
    ref => ref.parent != referencePath.parent
  );
  refs.forEach(ref => {
    semanticChildCallback(ref, semanticPath);
    let [newRef, newSemanticPath] = TraceRHS(
      ref,
      semanticPath,
      semanticChildCallback
    );
    TraceLHS(newRef, newSemanticPath, semanticChildCallback);
  });
}

function TraceLHS(ref, semanticPath, semanticChildCallback) {
  let ptr = ref;
  let newSemanticPath = [...semanticPath];
  if (ptr.parentPath.type === "VariableDeclarator") {
    const LHS = ptr.parentPath.get("id");
    parseObjectPattern(LHS, newSemanticPath);
  }

  // hoisted up
  function parseObjectPattern(ref, semanticPath) {
    console.log("parseObjectPattern", ref);
    if (ref.type === "ObjectPattern") {
      const properties = ref.get("properties");
      properties.forEach(property => {
        const key = property.get("key");
        semanticPath.push(key.node.name);
        // call semanticChildCallback somewhere
        const value = property.get("value");
        parseObjectPattern(value, semanticPath);
        console.log({ value, semanticPath });
      });
    } else if (ref.type === "Identifier") {
      const idname = ref.get("name");
      console.log({ idname: idname.node, semanticPath });
      semanticTrace(ref, idname.node, semanticChildCallback, semanticPath);
    }
  }
}

function TraceRHS(ref, semanticPath, semanticChildCallback) {
  let ptr = ref;
  let newSemanticPath = [...semanticPath];
  while (isValidRHSParent(ptr)) {
    ptr = ptr.parentPath;
    workOnRHSParent(ptr, newSemanticPath, semanticChildCallback);
  }
  console.log("TraceRHS", { newSemanticPath, ptr });
  return [ptr, newSemanticPath];

  // hoisted up
  function isValidRHSParent(ptr) {
    if (ptr.parentPath.type === "MemberExpression") return true;
    return false;
  }
  function workOnRHSParent(ptr, newSemanticPath, semanticChildCallback) {
    if (ptr.type === "MemberExpression") {
      const newPath = ptr.node.property.name;
      newSemanticPath.push(newPath);
      // call semanticChildCallback somewhere
    }
  }
}
```

this builds up a `semanticPath` of: `["foo", "bar", "child1", "child11", "foo", "child2"]`

which is very nice. now i have to make the callbacks work.

---

## working semanticVisitor

ok my `semanticVisitor` does a good trace now:

```js
module.exports = createMacro(myMacro);

function myMacro(props) {
  const { references, state, babel } = props;
  const {
    pseudoFunction = [],
    JSXMacro = [],
    default: defaultImport = []
  } = references;

  const visitorState = {};
  const semanticVisitor = {
    default(...args) {
      console.log("[debugging callback]", ...args);
    },
    CallExpression(...args) {
      console.log("CallExpression", ...args);
    },
    VariableDeclarator(...args) {
      console.log("VariableDeclarator", ...args);
    }
  };
  pseudoFunction.forEach(referencePath => {
    if (referencePath.parentPath.type === "CallExpression") {
      const origin = referencePath.container.arguments[0].name;
      semanticTrace(referencePath, origin, semanticVisitor);
    } else {
      console.log("invalid use of pseudofunction: ", referencePath);
    }
  });
}

/* here is the source of the semanticTrace utility */
function semanticTrace(
  referencePath,
  origin,
  semanticVisitor,
  semanticPath = []
) {
  const refs = referencePath.scope.bindings[origin].referencePaths.filter(
    ref => ref.parent != referencePath.parent
  );
  refs.forEach(ref => {
    let [newRef, newSemanticPath] = TraceRHS(
      ref,
      semanticPath,
      semanticVisitor
    );
    TraceLHS(newRef, newSemanticPath, semanticVisitor);
  });
  conditionalCall(semanticVisitor, "default", semanticPath);
}

function TraceLHS(ref, semanticPath, semanticVisitor) {
  let ptr = ref;
  let newSemanticPath = [...semanticPath];
  if (ptr.parentPath.type === "VariableDeclarator") {
    const LHS = ptr.parentPath.get("id");
    parseObjectPattern(LHS, newSemanticPath);
  }

  // hoisted up
  function parseObjectPattern(ref, semanticPath) {
    /* --- we do conCall but the semanticVisitor should ideally perform no actions apart from rename  */
    conditionalCall(semanticVisitor, ref.type, "LHS", ref, semanticPath);
    /* --- we do conCall but should have no actions performed on it  */
    if (ref.type === "ObjectPattern") {
      const properties = ref.get("properties");
      properties.forEach(property => {
        let newSemanticPath = [...semanticPath];
        const key = property.get("key");
        newSemanticPath.push(key.node.name);
        const value = property.get("value");
        parseObjectPattern(value, newSemanticPath);
      });
    } else if (ref.type === "Identifier") {
      const idname = ref.get("name");
      semanticTrace(ref, idname.node, semanticVisitor, semanticPath);
    }
  }
}

function TraceRHS(ref, semanticPath, semanticVisitor) {
  let ptr = ref;
  let newSemanticPath = [...semanticPath];
  while (isValidRHSParent(ptr)) {
    ptr = ptr.parentPath;
    workOnRHSParent(ptr, newSemanticPath, semanticVisitor);
  }
  return [ptr, newSemanticPath];

  // hoisted up
  function isValidRHSParent(ptr) {
    const baseLayer = ["Member", "Call"]
      .map(x => x + "Expression")
      .includes(ptr.parentPath.type);
    const validGrandParent =
      ptr.parentPath.parentPath.type != "ExpressionStatement";
    return baseLayer && validGrandParent;
  }
  function workOnRHSParent(ptr, newSemanticPath, semanticVisitor) {
    if (ptr.type === "MemberExpression") {
      const newPath = ptr.node.property.name;
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
    /*
    else if (ptr.type === "CallExpression") {
      
    }
    */
  }
}

function conditionalCall(visitor, key, ...args) {
  if (visitor[key]) visitor[key](...args);
}
```

for this test script:

```js
import { pseudoFunction } from "AnyNameThatEndsIn.macro";
var abc = {};
pseudoFunction(abc); // tags the object, disappears
console.log(2 + 3, abc); // should have no response
const {
  child1: { child11: boop },
  child2
} = abc.foo("@test", "poo").bar;
const beep = boop.baz;
const { childX } = beep.food;
```

and that generates this trace: `["foo", "bar", "child1", "child11", "baz", "food", "childX"]` as well as `["foo", "bar", "child2"]`

Now i need to do array properties!

---

## stopped for the day at here

<https://latest.astexplorer.net/#/gist/01983f61e310f1eaf6b12a221556a937/7986b05e19b997db99754a777746df0a617c0d17>