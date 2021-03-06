"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _core = require("@babel/core");

var _babelPluginExtractMessages = _interopRequireDefault(require("@lingui/babel-plugin-extract-messages"));

var _detect = require("../detect");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var babelRe = new RegExp("\\.(" + [].concat((0, _toConsumableArray2.default)(_core.DEFAULT_EXTENSIONS), [".ts", ".tsx"]).map(function (ext) {
  return ext.slice(1);
}).join("|") + ")$", "i");
var extractor = {
  match: function match(filename) {
    return babelRe.test(filename);
  },
  extract: function extract(filename, localeDir) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var _options$babelOptions = options.babelOptions,
        _babelOptions = _options$babelOptions === void 0 ? {} : _options$babelOptions,
        configPath = options.configPath;

    var _babelOptions$plugins = _babelOptions.plugins,
        plugins = _babelOptions$plugins === void 0 ? [] : _babelOptions$plugins,
        babelOptions = (0, _objectWithoutProperties2.default)(_babelOptions, ["plugins"]);
    var frameworkOptions = {};

    if (options.projectType === _detect.projectType.CRA) {
      frameworkOptions.presets = ["react-app"];
    }

    (0, _core.transformFileSync)(filename, _objectSpread(_objectSpread(_objectSpread({}, babelOptions), frameworkOptions), {}, {
      // we override envName to avoid issues with NODE_ENV=production
      // https://github.com/lingui/js-lingui/issues/952
      envName: "development",
      plugins: ["macros", [_babelPluginExtractMessages.default, {
        localeDir: localeDir,
        configPath: configPath
      }]].concat((0, _toConsumableArray2.default)(plugins))
    }));
  }
};
var _default = extractor;
exports.default = _default;