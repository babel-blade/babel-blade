# babel-plugin-boilerplate

> TODO:  description of what this babel plugin does

## Example

### Input

```js
// TODO: insert example input
function add(a, b) {
  console.log(a, b)
  return a + b
}
```

### Output

```js
// TODO: insert example output
function dda(a, b) {
  elosnoc.gol(a, b)
  return a + b
}
```

## Installation

```sh
npm install --save-dev babel-plugin-NEWPLUGINNAME #TODO: insert new plugin name
```

If you want to use it with babel@7, you should also install `babel-core@^7.0.0-0` (just to prevent peer dep warnings).

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["babel-plugin-NEWPLUGINNAME"] // TODO: insert new plugin name
}
```

### Via CLI

```sh
babel --plugins babel-plugin-NEWPLUGINNAME script.js # TODO: insert new plugin name
```

### Via Node API

```javascript
require('babel-core').transform('code', {
  plugins: ['babel-plugin-NEWPLUGINNAME'], // TODO: insert new plugin name
})
```
