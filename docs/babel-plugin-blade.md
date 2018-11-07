---
id: babel-plugin-blade
title: As a babel plugin
---

> **obligatory note**: babel-blade is not yet production ready! Please proceed only if you are an early adopter. Feel free to chat with [@swyx](https://twitter.com/swyx) or [check our issues!](https://github.com/sw-yx/babel-blade/issues/)

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
  plugins: ['babel-plugin-blade']
});
```
