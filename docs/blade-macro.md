---
id: blade-macro
title: As a babel macro
---

> **obligatory note**: babel-blade is not yet production ready! Please proceed only if you are an early adopter. Feel free to chat with [@swyx](https://twitter.com/swyx) or [check our issues!](https://github.com/sw-yx/babel-blade/issues/)

## Installation

This module is distributed via npm which is bundled with node and
should be installed as one of your project's `devDependencies`:

```
npm install --save-dev blade.macro
```

You'll also need to install and configure
[`babel-plugin-macros`][https://www.npmjs.com/package/babel-plugin-macros] if you haven't already.

## configuring `babel-plugin-macros`

just to save you some time - `npm i babel-plugin-macros`.

and then in `.babelrc`:

```
{

  "plugins": [
    "macros"
  ]
}
```

## in your JS file:

```js
import { createQuery } from 'blade.macro';
// or
import { createFragment } from 'blade.macro';
// or
import { createQuery, createFragment } from 'blade.macro';
```

you can then use these pseudofunctions in your app.

## Example Demo

Check out [this codesandbox](https://codesandbox.io/s/4lwoovknx9).
