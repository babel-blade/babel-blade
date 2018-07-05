"use strict";

var _require = require('babel-plugin-macros'),
    createMacro = _require.createMacro;

var _require2 = require('./helpers'),
    getReplacement = _require2.getReplacement;

module.exports = createMacro(prevalMacros);

function prevalMacros(_ref) {// do something here

  var references = _ref.references,
      state = _ref.state,
      babel = _ref.babel;
}