# blade.macro

[![Babel Macro](https://img.shields.io/badge/babel--macro-%F0%9F%8E%A3-f5da55.svg?style=flat-square)](https://github.com/kentcdodds/babel-macros)

This is a [`babel-macros`][babel-macros] macro for
[`babel-plugin-blade`][babel-plugin-blade].

Please see those projects for more information.

## Installation

This module is distributed via [npm][npm] which is bundled with [node][node] and
should be installed as one of your project's `devDependencies`:

```
npm install --save-dev blade.macro
```

You'll also need to install and configure [`babel-macros`][babel-macros] if you
haven't already.

## Usage

Once you've [configured `babel-macros`](https://github.com/kentcdodds/babel-macros/blob/master/other/docs/user.md)
you can import/require `blade.macro`. For example:

```js
import blade from 'babel-plugin-blade/macro'

// before

      ↓ ↓ ↓ ↓ ↓ ↓

// after
```

You'll find more usage capabilities in the
[`babel-plugin-blade` test snapshots][snapshots].

**Note**:

[`babel-plugin-blade`][babel-plugin-blade] allows you to have a few more APIs
than you have with this macro, but this macro comes with all the benefits of using
[`babel-macros`][babel-macros] (which you can read about in the `babel-macros` docs).

[npm]: https://www.npmjs.com/
[node]: https://nodejs.org
[babel-macros]: https://github.com/kentcdodds/babel-macros
[babel-plugin-blade]: https://github.com/kentcdodds/babel-plugin-blade
[snapshots]: https://github.com/kentcdodds/babel-plugin-blade/blob/master/src/__tests__/__snapshots__/macro.js.snap

