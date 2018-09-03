---
title: Failed attempt at adding array methods
author: swyx
authorURL: http://twitter.com/swyx
authorImageURL: https://pbs.twimg.com/profile_images/990728399873232896/CMPn3IxT_400x400.jpg
---

One thing I have been punting on for a long while is how to deal with array methods. this is the problem. The chosen API i have for doing inline query arguments looks like this:

```js
// `data` and `createdQuery` declared above
const DATA = createdQuery(data);
const list = DATA.list("id:234");
const listtitle = list.title;
```

this generates a graphql query that looks like:

```graphql
query createdQuery {
  list(id: 234) {
    title
  }
}
```

That's nice, but what happens when the field is an array and I want to map over it?

```js
// `data` and `createdQuery` declared above
const DATA = createdQuery(data);
const list = DATA.list("id:234");
list.map(item => console.log(item.title));
```

`map` looks like a GraphQL property to our babel plugin!

_note: below generated graphql is not real, just trying to illustrate the problem_

```graphql
query createdQuery {
  list(id: 234) {
    map {
      title
    }
  }
}
```

what we need is for our parser to "ignore" the `map` call, and then declare `item` a blade and re process it again.

previously to deal with this i simply blacklisted Array.prototype methods but that obviously wasn't very seamless.

## fixing the babel parser

The key part comes here when we parse the RHS of an assignment:

```js
const RHSVisitor = {
  MemberExpression(childpath) {
    let aliasPath, calleeArguments;
    if (isCallee(childpath)) {
      // if its a callee, extract its args and push it into RHS
      // will parse out fragments/args/directives later
      calleeArguments = getCalleeArgs(childpath);
      aliasPath = childpath;
    }
    // hacky dodge for array methods; just ignores them for now
    // we will have to make iteration methods also count as blades
    for (const prop of arrayPrototype) {
      if (childpath.node.property.name === prop) {
        return;
      }
    }
    if (childpath.parentKey !== "arguments")
      // else it will include membexps inside call arguments
      RHS.push({
        name: childpath.node.property.name,
        calleeArguments,
        aliasPath
      });
  }
};
```

the hacky `return` in there skips `map` and its brethren, but the visitor continues operation when I really need to interrupt it. according to the docs you can [skip or stop traversal](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#stopping-traversal). `Stop` is the right call here because i dont really care about siblings (though i am probably writing the traversal wrong due to my inexperience; i look for references in scope and iterate through manually but maybe that is not strictly necessary. sad)

so editing the hacky bit above:

```js
// hacky dodge for array methods; just ignores them for now
// we will have to make iteration methods also count as blades
for (const prop of arrayPrototype) {
  // i will rewrite this later to use array.includes
  if (childpath.node.property.name === prop) {
    childpath.stop();
    return;
  }
}
```

this breaks the above parsing appropriately and generates a shorter graphql query:

```graphql
query createdQuery {
  list(id: 234)
}
```

and now we have to `parseBlade` on the `map` child.

---

## a first solution

Ok it took an hour or two but I figured it out. the trick is to use `.get` liberally so that you keep using the path instead of the node ([thank you SO](https://stackoverflow.com/questions/43641032/babel-plugin-how-to-get-the-path-for-a-given-node)).

So this code:

```js
// hacky dodge for the other array prototype methods
if (arrayPrototype.includes(childPropName)) {
  childpath.stop();
  const args = getCalleeArgs(childpath);
  if (args.length) {
    const mapBladeID = args[0].params[0].name;
    const argPath = childpath.parentPath.get("arguments")[0];
    parseBlade(argPath, mapBladeID, razorData);
  }
  return;
}
```

calls `parseBlade` correctly within the scope of the arguments of the arrow or normal function and generates the correct graphql. Given this:

```js
// `data` and `createdQuery` declared above
const DATA = createdQuery(data);
const list = DATA.list("id:234");
list.map(item => console.log(item.title));
```

generate this:

```graphql
query createdQuery {
  list(id: 234) {
    title
  }
}
```

so it treats `.map` correctly by "skipping over it".

## Testing

ok so map works but nesting maybe doesnt work so well. this js:

```js
const DATA = movieQuery(data);
const { actors } = DATA.movie("id: 234").credits;
return (
  <div>
    {actors.map(actor2 => {
      console.log(actor2.films.map(a => a.year));
      return (
        <div>
          <h2>{actor2.leading}</h2>
          <h2>{actor2.supporting}</h2>
        </div>
      );
    })}
  </div>
);
```

generates this:

```graphql
query movieQuery {
  movie_659a: movie(id: 234) {
    credits {
      actors {
        year
        leading
        supporting
      }
    }
  }
}
```

and is missing the `films` bit. time to investigate...

---

## solving nested maps

this is happening because i'm not supplying the right slice of `razorData` when i parse. i may need to move my callsite of `parseBlade` lower down the `LHS-RHS` parsing.

I tried this inside the MERGE RHS FIRST section:

```js
currentData = currentData.add({
  name,
  args,
  directives,
  fragments
});

if (arrayPrototype.includes(name)) {
  const args = getCalleeArgs(aliasPath);
  if (args.length) {
    const mapBladeID = args[0].params[0].name;
    const argPath = aliasPath.parentPath.get("arguments")[0];
    parseBlade(argPath, mapBladeID, currentData);
  }
  // console.log('----', {calleeArguments, name, aliasPath})
} else {
  if (currentData._args && aliasPath)
    aliasPath.parentPath.replaceWith(aliasPath);
  if (currentData._alias && aliasPath)
    aliasPath.node.property.name = currentData._alias;
}
```

but this was throwing some weird error: `app-52921c056e00d2b70dc2-16.js:611 TypeError: blade.macro: Cannot read property 'name' of undefined` probably due to some downstream printing issues. i need to just filter out the array prototype method names at the source and manually manipulate `razorData`.

---

ok i have to call a halt. i discovered an even worse flaw in my output that i havent tested enough. :( array methods will have to be on hold for now.

this js:

```js
const DATA = movieQuery(data);
console.log(DATA.type);
```

generates:

```graphql
  type {
    log_a057: log(${DATA.type})
  }
```

so its not robust to `console.log`. i need to fix that first.

---

[semantic traversal exploration](http://astexplorer.net/#/gist/0d97e2d0355fcf096212b5fc96ca60a5/b4298c1d38e6c9b3c16c776424d48196c9118f04)
