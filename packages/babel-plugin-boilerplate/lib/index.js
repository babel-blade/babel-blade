"use strict";

exports.__esModule = true;
exports.default = void 0;

// TODO: WRITE BABEL PLUGIN
// TODO: ???
// TODO: PROFIT
// import semver from 'semver'
// import jsx from '@babel/plugin-syntax-jsx'
// import jsx6 from 'babel-plugin-syntax-jsx'
var _default = function _default(_ref) {
  var t = _ref.types,
      template = _ref.template,
      version = _ref.version;
  return {
    name: 'ast-transform',
    // not required
    visitor: {
      Identifier(path) {
        path.node.name = path.node.name.split('').reverse().join('');
      }

    }
  };
};

exports.default = _default;