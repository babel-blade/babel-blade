---
id: babel-plugin-blade
title: As a babel plugin
---

## Installation

```sh
npm install --save-dev babel-plugin-blade
```

If you want to use it with babel@7, you should also install `babel-core@^7.0.0-0` (just to prevent peer dep warnings).

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["babel-plugin-blade"]
}
```

### Via CLI

```sh
babel --plugins babel-plugin-blade script.js
```

### Via Node API

```javascript
require('babel-core').transform('code', {
  plugins: ['babel-plugin-blade'],
})
```

