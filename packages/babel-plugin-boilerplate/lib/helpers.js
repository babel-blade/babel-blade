"use strict";

var p = require('path');

module.exports = {
  getReplacement,
  requireFromString
};

function requireFromString(_ref) {
  var stringToPreval = _ref.string,
      filename = _ref.fileOpts.filename,
      _ref$args = _ref.args,
      args = _ref$args === void 0 ? [] : _ref$args;
  console.log('hello there');
}

function getReplacement(_ref2) {
  var string = _ref2.string,
      fileOpts = _ref2.fileOpts,
      args = _ref2.args,
      babel = _ref2.babel;
  console.log('hello there');
}