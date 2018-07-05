"use strict";

exports.__esModule = true;
exports.default = void 0;

var _semver = _interopRequireDefault(require("semver"));

var _pluginSyntaxJsx = _interopRequireDefault(require("@babel/plugin-syntax-jsx"));

var _babelPluginSyntaxJsx = _interopRequireDefault(require("babel-plugin-syntax-jsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var last = function last(arr) {
  return arr.length > 0 ? arr[arr.length - 1] : undefined;
};

var memoize = function memoize(fn) {
  var cached;
  return function () {
    if (cached) {
      return cached;
    }

    return cached = fn.apply(void 0, arguments);
  };
};

var _default = function _default(_ref) {
  var t = _ref.types,
      template = _ref.template,
      version = _ref.version;

  var babel6 = _semver.default.satisfies(version, '^6.0.0');

  var cloneNode = typeof t.cloneNode === 'function' ? t.cloneNode : t.cloneDeep;
  var jsxElement = typeof t.jsxElement === 'function' ? t.jsxElement : t.jSXElement;
  var jsxExpressionContainer = typeof t.jsxExpressionContainer === 'function' ? t.jsxExpressionContainer : t.jSXExpressionContainer;

  var unwrapFunctionEnvironment = function unwrapFunctionEnvironment(path) {
    return typeof path.unwrapFunctionEnvironment === 'function' ? path.unwrapFunctionEnvironment() : path.node.shadow = true;
  };

  var addAdoptChildren = memoize(function (file) {
    var id = file.scope.generateUidIdentifier('adoptChildren');
    var helper = template(`
      function ID(it, adopted) {
        const { value: element, done } = it.next(adopted)
        if (done) return element
        return React.cloneElement(element, null, adopted => ID(it, adopted))
      }
    `)({
      ID: id
    });

    var _file$path$unshiftCon = file.path.unshiftContainer('body', [helper]),
        inserted = _file$path$unshiftCon[0];

    file.scope.registerDeclaration(inserted);
    return id;
  });

  var tryUnnesting = function tryUnnesting(_ref2, state) {
    var parentPath = _ref2.parentPath,
        node = _ref2.node,
        key = _ref2.key,
        scope = _ref2.scope;

    if (state === void 0) {
      state = {
        success: true,
        nodes: [node],
        index: 0,
        id: null
      };
    }

    if (parentPath.isExpressionStatement()) {
      return state;
    } else if (parentPath.isVariableDeclarator()) {
      var id = parentPath.get('id').node;
      var parentKey = parentPath.key,
          declaration = parentPath.parentPath;
      var _declaration$node = declaration.node,
          kind = _declaration$node.kind,
          declarations = _declaration$node.declarations;

      if (state.nodes.length - 1 === state.index) {
        state.id = id;
      }

      if (parentKey > 0) {
        state.index++;
      }

      state.nodes = [parentKey > 0 && t.variableDeclaration(kind, declarations.slice(0, parentKey))].concat(state.nodes.slice(0, -1), [t.variableDeclaration(kind, [t.variableDeclarator(id, last(state.nodes))]), parentKey < declarations.length - 1 && t.variableDeclaration(kind, declarations.slice(parentKey + 1))]).filter(Boolean);
      return state;
    } else if (parentPath.isAssignmentExpression()) {
      var _parentPath$node = parentPath.node,
          operator = _parentPath$node.operator,
          left = _parentPath$node.left;
      var _id = parentPath.get('left').node;

      if (state.nodes.length - 1 === state.index) {
        state.id = scope.generateUidIdentifierBasedOnNode(_id);
      }

      state.nodes = state.nodes.slice(0, -1).concat([t.assignmentExpression(operator, left, last(state.nodes)), state.id && t.assignmentExpression('=', _id, state.id)]).filter(Boolean);
      return tryUnnesting(parentPath, state);
    } else if (parentPath.isSequenceExpression()) {
      var expressions = parentPath.node.expressions;

      if (key > 0) {
        state.index++;
      }

      state.nodes = [key > 0 && t.sequenceExpression(expressions.slice(0, key))].concat(state.nodes, [key < expressions.length - 1 && t.sequenceExpression(expressions.slice(key + 1))]).filter(Boolean);
      return tryUnnesting(parentPath, state);
    } else {
      return {
        success: false
      };
    }
  };

  var buildAdopted = function buildAdopted(_ref3) {
    var TAG = _ref3.TAG,
        ADOPTED = _ref3.ADOPTED,
        REST = _ref3.REST;

    /*
      <TAG>{ADOPTED => {
        REST
      }}</TAG>
    */
    var openingTag = cloneNode(TAG);
    openingTag.selfClosing = false;
    var closingTag = cloneNode(TAG);
    closingTag.type = 'JSXClosingElement';
    return jsxElement(openingTag, closingTag, [jsxExpressionContainer(t.arrowFunctionExpression([ADOPTED], t.blockStatement(REST)))]);
  };

  var isAdoptingCall = function isAdoptingCall(path) {
    return path.get('callee.name').node === 'adopt' && path.get('arguments.0').isJSXElement();
  };

  var convertFunctionParentToGenerator = function convertFunctionParentToGenerator(file, path) {
    var fnPath = path.findParent(function (p) {
      return p.isFunction();
    });
    var id = fnPath.scope.generateUidIdentifier('adopter');
    var bodyPath = fnPath.get('body');
    var gen = t.functionDeclaration(id, [], bodyPath.node, true);
    bodyPath.replaceWith(t.blockStatement([gen, t.returnStatement(t.callExpression(cloneNode(addAdoptChildren(file)), [t.callExpression(id, [])]))]));
    var genPath = bodyPath.get('body.0');
    fnPath.scope.registerDeclaration(genPath);
    unwrapFunctionEnvironment(genPath);
    genPath.traverse({
      Function: function Function(path) {
        return path.skip();
      },

      CallExpression(path) {
        if (!isAdoptingCall(path)) {
          return;
        }

        path.replaceWith(t.yieldExpression(path.get('arguments.0').node));
      }

    });
  };

  return {
    inherits: babel6 ? _babelPluginSyntaxJsx.default : _pluginSyntaxJsx.default,
    visitor: {
      CallExpression(path, _ref4) {
        var file = _ref4.file;

        if (!isAdoptingCall(path)) {
          return;
        }

        var stmt = path.findParent(function (p) {
          return p.isStatement();
        });
        var stmtKey = stmt.key;

        if (!stmt.parentPath.isBlockStatement() || !stmt.parentPath.parentPath.isFunction()) {
          convertFunctionParentToGenerator(file, path);
          return;
        }

        var _tryUnnesting = tryUnnesting(path),
            success = _tryUnnesting.success,
            nodes = _tryUnnesting.nodes,
            index = _tryUnnesting.index,
            id = _tryUnnesting.id;

        if (success === false) {
          convertFunctionParentToGenerator(file, path);
          return;
        }

        if (nodes.length > 1) {
          stmt.replaceWithMultiple(nodes.map(function (node) {
            return t.isStatement(node) ? node : t.expressionStatement(node);
          }));
        }

        var updatedStmt = stmt.getSibling(stmtKey + index);
        var constId = stmt.isVariableDeclaration({
          kind: 'const'
        }) ? path.scope.generateUidIdentifierBasedOnNode(id) : null;
        var nextSiblings = updatedStmt.getAllNextSiblings();
        var nextNodes = nextSiblings.map(function (p) {
          return p.node;
        });
        updatedStmt.replaceWith(t.returnStatement(buildAdopted({
          TAG: path.get('arguments.0.openingElement').node,
          ADOPTED: constId ? constId : id,
          REST: constId ? [t.variableDeclaration('const', [t.variableDeclarator(id, constId)])].concat(nextNodes) : nextNodes
        })));
        nextSiblings.forEach(function (path) {
          return path.remove();
        });
      }

    }
  };
};

exports.default = _default;