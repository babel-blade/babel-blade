<div align="center">
<h1>babel-plugin-boilerplate :emoji:</h1>

<p>your next babel plugin description</p>
</div>

<hr />

<!-- prettier-ignore-start -->
[![All Contributors](https://img.shields.io/badge/all_contributors-4-orange.svg?style=flat-square)](#contributors)
[![PRs Welcome][prs-badge]][prs]
[![Code of Conduct][coc-badge]][coc]
[![Babel Macro](https://img.shields.io/badge/babel--macro-%F0%9F%8E%A3-f5da55.svg?style=flat-square)](https://github.com/kentcdodds/babel-plugin-macros)
<!-- prettier-ignore-end -->

## The problem

The problem your plugin solves

> more resources the user shoudl read

## This solution

What this plugin does

How this plugin works

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Usage](#usage)
  - [first usage style](#first-usage-style)
  - [usage style 2](#usage-style-2)
- [Configure with Babel](#configure-with-babel)
  - [Via `.babelrc` (Recommended)](#via-babelrc-recommended)
  - [Via CLI](#via-cli)
  - [Via Node API](#via-node-api)
- [Use with `babel-plugin-macros`](#use-with-babel-plugin-macros)
  - [APIs not supported by the macro](#apis-not-supported-by-the-macro)
- [Caveats](#caveats)
- [Examples](#examples)
- [Inspiration](#inspiration)
- [Other Solutions](#other-solutions)
- [Contributors](#contributors)
- [LICENSE](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

This module is distributed via [npm][npm] which is bundled with [node][node] and
should be installed as one of your project's `devDependencies`:

```
npm install --save-dev babel-plugin-boilerplate
```

## Usage

More notes on usage

### first usage style

**Before**:

```javascript
// before
```

**After** some notes here:

```javascript
// after
```

more notes here!

**Before**:

```javascript
// before
```

**After** more notes here:

```javascript
// after
```

### usage style 2

**Before**:

```javascript
// before
```

**After** more notes here:

```javascript
// after
```

## Configure with Babel

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["BOILERPLATE"]
}
```

### Via CLI

```sh
babel --plugins BOILERPLATE script.js
```

### Via Node API

```javascript
require('babel-core').transform('code', {
  plugins: ['BOILERPLATE'],
})
```

## Use with `babel-plugin-macros`

Once you've
[configured `babel-plugin-macros`](https://github.com/kentcdodds/babel-plugin-macros/blob/master/other/docs/user.md)
you can import/require the boilerplate macro at `babel-plugin-boilerplate/macro`. For
example:

```javascript
import yourmacro from 'babel-plugin-boilerplate/macro'

// user yourmacro

      ↓ ↓ ↓ ↓ ↓ ↓

// output
```

### APIs not supported by the macro

- one
- two

> You could also use [`boilerplate.macro`][boilerplate.macro] if you'd prefer to type
> less 😀

## Caveats

any caveats you like to say

## Examples

- Some examples and links here

## Inspiration

This is based on [babel-plugin-boilerplate](https://github.com/kentcdodds/babel-plugin-boilerplate).

## Other Solutions

I'm not aware of any, if you are please [make a pull request][prs] and add it
here!

## Contributors

Thanks goes to these people ([emoji key][emojis]):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars.githubusercontent.com/u/1500684?v=3" width="100px;"/><br /><sub><b>Kent C. Dodds</b></sub>](https://kentcdodds.com)<br />[💻](https://github.com/sw-yx/babel-plugin-boilerplate/commits?author=kentcdodds "Code") [📖](https://github.com/sw-yx/babel-plugin-boilerplate/commits?author=kentcdodds "Documentation") [🚇](#infra-kentcdodds "Infrastructure (Hosting, Build-Tools, etc)") [⚠️](https://github.com/sw-yx/babel-plugin-boilerplate/commits?author=kentcdodds "Tests") | [<img src="https://avatars1.githubusercontent.com/u/1958812?v=4" width="100px;"/><br /><sub><b>Michael Rawlings</b></sub>](https://github.com/mlrawlings)<br />[💻](https://github.com/sw-yx/babel-plugin-boilerplate/commits?author=mlrawlings "Code") [📖](https://github.com/sw-yx/babel-plugin-boilerplate/commits?author=mlrawlings "Documentation") [⚠️](https://github.com/sw-yx/babel-plugin-boilerplate/commits?author=mlrawlings "Tests") | [<img src="https://avatars3.githubusercontent.com/u/5230863?v=4" width="100px;"/><br /><sub><b>Jan Willem Henckel</b></sub>](https://jan.cologne)<br />[💻](https://github.com/sw-yx/babel-plugin-boilerplate/commits?author=djfarly "Code") [📖](https://github.com/sw-yx/babel-plugin-boilerplate/commits?author=djfarly "Documentation") [⚠️](https://github.com/sw-yx/babel-plugin-boilerplate/commits?author=djfarly "Tests") | [<img src="https://avatars3.githubusercontent.com/u/1824298?v=4" width="100px;"/><br /><sub><b>Karan Thakkar</b></sub>](https://twitter.com/geekykaran)<br />[📖](https://github.com/sw-yx/babel-plugin-boilerplate/commits?author=karanjthakkar "Documentation") |
| :---: | :---: | :---: | :---: |

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors][all-contributors] specification.
Contributions of any kind welcome!

## LICENSE

MIT

<!-- prettier-ignore-start -->

[npm]: https://www.npmjs.com/
[node]: https://nodejs.org
[build-badge]: https://img.shields.io/travis/kentcdodds/babel-plugin-boilerplate.svg?style=flat-square
[build]: https://travis-ci.org/kentcdodds/babel-plugin-boilerplate
[coverage-badge]: https://img.shields.io/codecov/c/github/kentcdodds/babel-plugin-boilerplate.svg?style=flat-square
[coverage]: https://codecov.io/github/kentcdodds/babel-plugin-boilerplate
[version-badge]: https://img.shields.io/npm/v/babel-plugin-boilerplate.svg?style=flat-square
[package]: https://www.npmjs.com/package/babel-plugin-boilerplate
[downloads-badge]: https://img.shields.io/npm/dm/babel-plugin-boilerplate.svg?style=flat-square
[npmtrends]: http://www.npmtrends.com/babel-plugin-boilerplate
[license-badge]: https://img.shields.io/npm/l/babel-plugin-boilerplate.svg?style=flat-square
[license]: https://github.com/kentcdodds/babel-plugin-boilerplate/blob/master/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[donate-badge]: https://img.shields.io/badge/$-support-green.svg?style=flat-square
[coc-badge]: https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square
[coc]: https://github.com/kentcdodds/babel-plugin-boilerplate/blob/master/other/CODE_OF_CONDUCT.md
[emojis]: https://github.com/kentcdodds/all-contributors#emoji-key
[all-contributors]: https://github.com/kentcdodds/all-contributors
[glamorous]: https://github.com/paypal/glamorous
[preval]: https://github.com/kentcdodds/babel-plugin-preval
[boilerplate.macro]: https://www.npmjs.com/package/boilerplate.macro
[babel-plugin-macros]: https://github.com/kentcdodds/babel-plugin-macros

<!-- prettier-ignore-end -->
