"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _fs = _interopRequireDefault(require("fs"));

var _core = require("@babel/core");

var _babelPluginExtractMessages = _interopRequireDefault(require("@lingui/babel-plugin-extract-messages"));

var _detect = require("../detect");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var typescriptRe = /(^.?|\.[^d]|[^.]d|[^.][^d])\.tsx?$/i;
var extractor = {
  match: function match(filename) {
    return typescriptRe.test(filename);
  },
  extract: function extract(filename, localeDir) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var ts = require("typescript");

    var content = _fs.default.readFileSync(filename, "utf8");

    var isTsx = filename.endsWith(".tsx"); // pass jsx to babel untouched

    var jsx = isTsx ? ts.JsxEmit.Preserve : ts.JsxEmit.None;
    var stripped = ts.transpileModule(content, {
      compilerOptions: {
        filename: filename,
        jsx: jsx,
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2016,
        // use ES2015 or ES2016 to preserve tagged template literal
        allowSyntheticDefaultImports: true,
        moduleResolution: ts.ModuleResolutionKind.NodeJs
      }
    });
    var frameworkOptions = {};

    if (options.projectType === _detect.projectType.CRA) {
      frameworkOptions.presets = ["react-app"];
    }

    var _options$babelOptions = options.babelOptions,
        babelOptions = _options$babelOptions === void 0 ? {} : _options$babelOptions,
        configPath = options.configPath;
    var plugins = ["macros", [_babelPluginExtractMessages.default, {
      localeDir: localeDir,
      configPath: configPath
    }]].concat((0, _toConsumableArray2.default)(babelOptions.plugins || []));

    if (isTsx) {
      plugins.unshift(require.resolve("@babel/plugin-syntax-jsx"));
    }

    (0, _core.transform)(stripped.outputText, _objectSpread(_objectSpread(_objectSpread({}, babelOptions), frameworkOptions), {}, {
      filename: filename,
      plugins: plugins
    }));
  }
};
var _default = extractor;
exports.default = _default;