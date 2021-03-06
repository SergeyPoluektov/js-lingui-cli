"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = command;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime/helpers/interopRequireWildcard"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _chalk = _interopRequireDefault(require("chalk"));

var _chokidar = _interopRequireDefault(require("chokidar"));

var _commander = _interopRequireDefault(require("commander"));

var _conf = require("@lingui/conf");

var _catalog = require("./api/catalog");

var _stats = require("./api/stats");

var _detect = require("./api/detect");

var _help = require("./api/help");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function command(_x, _x2) {
  return _command.apply(this, arguments);
}

function _command() {
  _command = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2(config, options) {
    var catalogs, catalogStats, _iterator, _step, catalog;

    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            // `react-app` babel plugin used by CRA requires either BABEL_ENV or NODE_ENV to be
            // set. We're setting it here, because lingui macros are going to use them as well.
            if (!process.env.BABEL_ENV && !process.env.NODE_ENV) {
              process.env.BABEL_ENV = "development";
            } // We need macros to keep imports, so extract-messages plugin know what componets
            // to collect. Users usually use both BABEN_ENV and NODE_ENV, so it's probably
            // safer to introduce a new env variable. LINGUI_EXTRACT=1 during `lingui extract`


            process.env.LINGUI_EXTRACT = "1";
            options.verbose && console.error("Extracting messages from source files???");
            catalogs = (0, _catalog.getCatalogs)(config);
            catalogStats = {};
            _iterator = _createForOfIteratorHelper(catalogs);
            _context2.prev = 6;

            _iterator.s();

          case 8:
            if ((_step = _iterator.n()).done) {
              _context2.next = 15;
              break;
            }

            catalog = _step.value;
            _context2.next = 12;
            return catalog.make(_objectSpread(_objectSpread({}, options), {}, {
              orderBy: config.orderBy,
              extractors: config.extractors,
              projectType: (0, _detect.detect)()
            }));

          case 12:
            catalogStats[catalog.path] = catalog.readAll();

          case 13:
            _context2.next = 8;
            break;

          case 15:
            _context2.next = 20;
            break;

          case 17:
            _context2.prev = 17;
            _context2.t0 = _context2["catch"](6);

            _iterator.e(_context2.t0);

          case 20:
            _context2.prev = 20;

            _iterator.f();

            return _context2.finish(20);

          case 23:
            Object.entries(catalogStats).forEach(function (_ref2) {
              var _ref3 = (0, _slicedToArray2.default)(_ref2, 2),
                  key = _ref3[0],
                  value = _ref3[1];

              console.log("Catalog statistics for ".concat(key, ": "));
              console.log((0, _stats.printStats)(config, value).toString());
              console.log();
            });

            if (!options.watch) {
              console.error("(use \"".concat(_chalk.default.yellow((0, _help.helpRun)("extract")), "\" to update catalogs with new messages)"));
              console.error("(use \"".concat(_chalk.default.yellow((0, _help.helpRun)("compile")), "\" to compile catalogs for production)"));
            } // If service key is present in configuration, synchronize with cloud translation platform


            if ((0, _typeof2.default)(config.service) === 'object' && config.service.name && config.service.name.length) {
              Promise.resolve("./services/".concat(config.service.name)).then(function (s) {
                return (0, _interopRequireWildcard2.default)(require(s));
              }).then(function (module) {
                return module.default(config, options);
              }).catch(function (err) {
                return console.error("Can't load service module ".concat(config.service.name), err);
              });
            }

            return _context2.abrupt("return", true);

          case 27:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[6, 17, 20, 23]]);
  }));
  return _command.apply(this, arguments);
}

if (require.main === module) {
  _commander.default.option("--config <path>", "Path to the config file").option("--locale <locale>", "Only extract the specified locale").option("--overwrite", "Overwrite translations for source locale").option("--clean", "Remove obsolete translations").option("--debounce <delay>", "Debounces extraction for given amount of milliseconds").option("--verbose", "Verbose output").option("--convert-from <format>", "Convert from previous format of message catalogs").option("--watch", "Enables Watch Mode") // Obsolete options
  .option("--babelOptions", "Babel options passed to transform/extract plugins").option("--format <format>", "Format of message catalogs").parse(process.argv);

  var config = (0, _conf.getConfig)({
    configPath: _commander.default.config || process.env.LINGUI_CONFIG
  });
  var hasErrors = false;

  if (_commander.default.format) {
    hasErrors = true;
    var msg = "--format option is deprecated." + " Please set format in configuration https://lingui.js.org/ref/conf.html#format";
    console.error(msg);
    console.error();
  }

  if (_commander.default.babelOptions) {
    hasErrors = true;

    var _msg = "--babelOptions option is deprecated." + " Please set extractBabelOptions in configuration https://lingui.js.org/ref/conf.html#extractBabelOptions";

    console.error(_msg);
    console.error();
  }

  var prevFormat = _commander.default.convertFrom;

  if (prevFormat && config.format === prevFormat) {
    hasErrors = true;
    console.error("Trying to migrate message catalog to the same format");
    console.error("Set ".concat(_chalk.default.bold("new"), " format in LinguiJS configuration\n") + " and ".concat(_chalk.default.bold("previous"), " format using --convert-from option."));
    console.log();
    console.log("Example: Convert from lingui format to minimal");
    console.log(_chalk.default.yellow((0, _help.helpRun)("extract --convert-from lingui")));
    process.exit(1);
  }

  if (_commander.default.locale && !config.locales.includes(_commander.default.locale)) {
    hasErrors = true;
    console.error("Locale ".concat(_chalk.default.bold(_commander.default.locale), " does not exist."));
    console.error();
  }

  if (hasErrors) process.exit(1);

  var extract = function extract(filePath) {
    return command(config, {
      verbose: _commander.default.watch || _commander.default.verbose || false,
      clean: _commander.default.watch ? false : _commander.default.clean || false,
      overwrite: _commander.default.watch || _commander.default.overwrite || false,
      locale: _commander.default.locale,
      configPath: _commander.default.config || process.env.LINGUI_CONFIG,
      watch: _commander.default.watch || false,
      files: (filePath === null || filePath === void 0 ? void 0 : filePath.length) ? filePath : undefined,
      prevFormat: prevFormat
    });
  };

  var changedPaths = new Set();
  var debounceTimer;

  var dispatchExtract = function dispatchExtract(filePath) {
    // Skip debouncing if not enabled
    if (!_commander.default.debounce) return extract(filePath);
    filePath === null || filePath === void 0 ? void 0 : filePath.forEach(function (path) {
      return changedPaths.add(path);
    }); // CLear the previous timer if there is any, and schedule the next

    debounceTimer && clearTimeout(debounceTimer);
    debounceTimer = setTimeout( /*#__PURE__*/(0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee() {
      var filePath;
      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              filePath = (0, _toConsumableArray2.default)(changedPaths);
              changedPaths.clear();
              _context.next = 4;
              return extract(filePath);

            case 4:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    })), _commander.default.debounce);
  }; // Check if Watch Mode is enabled


  if (_commander.default.watch) {
    console.info(_chalk.default.bold("Initializing Watch Mode..."));
    var catalogs = (0, _catalog.getCatalogs)(config);
    var paths = [];
    var ignored = [];
    catalogs.forEach(function (catalog) {
      paths.push.apply(paths, (0, _toConsumableArray2.default)(catalog.include));
      ignored.push.apply(ignored, (0, _toConsumableArray2.default)(catalog.exclude));
    });

    var watcher = _chokidar.default.watch(paths, {
      ignored: ["/(^|[/\\])../"].concat(ignored),
      persistent: true
    });

    var onReady = function onReady() {
      console.info(_chalk.default.green.bold("Watcher is ready!"));
      watcher.on("add", function (path) {
        return dispatchExtract([path]);
      }).on("change", function (path) {
        return dispatchExtract([path]);
      });
    };

    watcher.on("ready", function () {
      return onReady();
    });
  } else if (_commander.default.args) {
    // this behaviour occurs when we extract files by his name
    // for ex: lingui extract src/app, this will extract only files included in src/app
    extract(_commander.default.args).then(function (result) {
      if (!result) process.exit(1);
    });
  } else {
    extract().then(function (result) {
      if (!result) process.exit(1);
    });
  }
}