# babel-NEWPLUGINNAME.macro

This is a [`babel-plugin-macros`][babel-plugin-macros] macro for
[`babel-plugin-NEWPLUGINNAME`][babel-plugin-NEWPLUGINNAME].

Please see those projects for more information.

## Installation

This module is distributed via [npm][npm] which is bundled with [node][node] and
should be installed as one of your project's `devDependencies`:

```
npm install --save-dev babel-NEWPLUGINNAME.macro
```

You'll also need to install and configure
[`babel-plugin-NEWPLUGINNAME`][babel-plugin-NEWPLUGINNAME] if you haven't already.

## Usage

Once you've
[configured `babel-plugin-macros`](https://github.com/kentcdodds/babel-plugin-macros/blob/master/other/docs/user.md)
you can import/require `NEWPLUGINNAME.macro`. For example:

```js
import newpluginname from 'NEWPLUGINNAME.macro'

const one = newpluginname`module.exports = 1 + 2 - 1 - 1`
```

**Note**:

[`babel-plugin-NEWPLUGINNAME`][babel-plugin-NEWPLUGINNAME] allows you to have a few more APIs
than you have with this macro, but this macro comes with all the benefits of
using [`babel-plugin-macros`][babel-plugin-macros] (which you can read about in
the `babel-plugin-macros` docs).
