"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createCompiledCatalog = createCompiledCatalog;
exports.compile = compile;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var t = _interopRequireWildcard(require("@babel/types"));

var _generator = _interopRequireDefault(require("@babel/generator"));

var _messageformatParser = require("messageformat-parser");

var R = _interopRequireWildcard(require("ramda"));

var _pseudoLocalize = _interopRequireDefault(require("./pseudoLocalize"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var INVALID_OBJECT_KEY_REGEX = /^(\d+[a-zA-Z]|[a-zA-Z]+\d)(\d|[a-zA-Z])*/;

/**
 * Transform a single key/value translation into a Babel expression,
 * applying pseudolocalization where necessary.
 */
function compileSingleKey(key, translation, shouldPseudolocalize) {
  if (shouldPseudolocalize) {
    translation = (0, _pseudoLocalize.default)(translation);
  }

  return t.objectProperty(t.stringLiteral(key), compile(translation));
}

function createCompiledCatalog(locale, messages, options) {
  var _options$strict = options.strict,
      strict = _options$strict === void 0 ? false : _options$strict,
      _options$namespace = options.namespace,
      namespace = _options$namespace === void 0 ? "cjs" : _options$namespace,
      pseudoLocale = options.pseudoLocale,
      _options$compilerBabe = options.compilerBabelOptions,
      compilerBabelOptions = _options$compilerBabe === void 0 ? {} : _options$compilerBabe,
      _options$pure = options.pure,
      pure = _options$pure === void 0 ? false : _options$pure;
  var shouldPseudolocalize = locale === pseudoLocale;
  var compiledMessages = R.keys(messages).map(function (key) {
    var value = messages[key]; // If the current ID's value is a context object, create a nested 
    // expression, and assign the current ID to that expression

    if ((0, _typeof2.default)(value) === "object") {
      var contextExpression = t.objectExpression(Object.keys(value).map(function (contextKey) {
        var contextTranslation = value[contextKey];
        return compileSingleKey(contextKey, contextTranslation, shouldPseudolocalize);
      }));
      return t.objectProperty(t.stringLiteral(key), contextExpression);
    } // Don't use `key` as a fallback translation in strict mode.


    var translation = messages[key] || (!strict ? key : "");
    return compileSingleKey(key, translation, shouldPseudolocalize);
  });
  var ast = pure ? t.objectExpression(compiledMessages) : buildExportStatement(t.objectExpression(compiledMessages), namespace);
  var code = (0, _generator.default)(ast, _objectSpread({
    minified: true,
    jsescOption: {
      minimal: true
    }
  }, compilerBabelOptions)).code;
  return pure ? JSON.parse(code) : "/*eslint-disable*/" + code;
}

function buildExportStatement(expression, namespace) {
  if (namespace === "es" || namespace === "ts") {
    // export const messages = { message: "Translation" }
    return t.exportNamedDeclaration(t.variableDeclaration("const", [t.variableDeclarator(t.identifier("messages"), expression)]));
  } else {
    var exportExpression = null;
    var matches = namespace.match(/^(window|global)\.([^.\s]+)$/);

    if (namespace === "cjs") {
      // module.exports.messages = { message: "Translation" }
      exportExpression = t.memberExpression(t.identifier("module"), t.identifier("exports"));
    } else if (matches) {
      // window.i18nMessages = { messages: { message: "Translation" }}
      exportExpression = t.memberExpression(t.identifier(matches[1]), t.identifier(matches[2]));
    } else {
      throw new Error("Invalid namespace param: \"".concat(namespace, "\""));
    }

    return t.expressionStatement(t.assignmentExpression("=", exportExpression, t.objectExpression([t.objectProperty(t.identifier("messages"), expression)])));
  }
}
/**
 * Compile string message into AST tree. Message format is parsed/compiled into
 * JS arrays, which are handled in client.
 */


function compile(message) {
  var tokens;

  try {
    tokens = (0, _messageformatParser.parse)(message);
  } catch (e) {
    throw new Error("Can't parse message. Please check correct syntax: \"".concat(message, "\" \n \n Messageformat-parser trace: ").concat(e.message));
  }

  var ast = processTokens(tokens);
  if (isString(ast)) return t.stringLiteral(ast);
  return ast;
}

function processTokens(tokens) {
  // Shortcut - if the message doesn't include any formatting,
  // simply join all string chunks into one message
  if (!tokens.filter(function (token) {
    return !isString(token);
  }).length) {
    return tokens.join("");
  }

  return t.arrayExpression(tokens.map(function (token) {
    if (isString(token)) {
      return t.stringLiteral(token); // # in plural case
    } else if (token.type === "octothorpe") {
      return t.stringLiteral("#"); // simple argument
    } else if (token.type === "argument") {
      return t.arrayExpression([t.stringLiteral(token.arg)]); // argument with custom format (date, number)
    } else if (token.type === "function") {
      var _params = [t.stringLiteral(token.arg), t.stringLiteral(token.key)];
      var format = token.param && token.param.tokens[0];

      if (format) {
        _params.push(t.stringLiteral(format.trim()));
      }

      return t.arrayExpression(_params);
    } // complex argument with cases


    var formatProps = [];

    if (token.offset) {
      formatProps.push(t.objectProperty(t.identifier("offset"), t.numericLiteral(parseInt(token.offset))));
    }

    token.cases.forEach(function (item) {
      var inlineTokens = processTokens(item.tokens);
      formatProps.push(t.objectProperty( // if starts with number must be wrapped with quotes
      INVALID_OBJECT_KEY_REGEX.test(item.key) ? t.stringLiteral(item.key) : t.identifier(item.key), isString(inlineTokens) ? t.stringLiteral(inlineTokens) : inlineTokens));
    });
    var params = [t.stringLiteral(token.arg), t.stringLiteral(token.type), t.objectExpression(formatProps)];
    return t.arrayExpression(params);
  }));
}

var isString = function isString(s) {
  return typeof s === "string";
};