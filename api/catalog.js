"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCatalogs = getCatalogs;
exports.getCatalogForFile = getCatalogForFile;
exports.getCatalogForMerge = getCatalogForMerge;
exports.normalizeRelativePath = normalizeRelativePath;
exports.order = order;
exports.orderByMessageId = orderByMessageId;
exports.orderByOrigin = orderByOrigin;
exports.cleanObsolete = exports.Catalog = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _os = _interopRequireDefault(require("os"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _path = _interopRequireDefault(require("path"));

var R = _interopRequireWildcard(require("ramda"));

var _chalk = _interopRequireDefault(require("chalk"));

var _glob = _interopRequireDefault(require("glob"));

var _micromatch = _interopRequireDefault(require("micromatch"));

var _normalizePath = _interopRequireDefault(require("normalize-path"));

var _formats = _interopRequireDefault(require("./formats"));

var _extractors = _interopRequireDefault(require("./extractors"));

var _utils = require("./utils");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var NAME = "{name}";
var LOCALE = "{locale}";
var LOCALE_SUFFIX_RE = /\{locale\}.*$/;
var PATHSEP = "/"; // force posix everywhere

var Catalog = /*#__PURE__*/function () {
  function Catalog(_ref, config) {
    var name = _ref.name,
        path = _ref.path,
        include = _ref.include,
        _ref$exclude = _ref.exclude,
        exclude = _ref$exclude === void 0 ? [] : _ref$exclude;
    (0, _classCallCheck2.default)(this, Catalog);
    (0, _defineProperty2.default)(this, "name", void 0);
    (0, _defineProperty2.default)(this, "path", void 0);
    (0, _defineProperty2.default)(this, "include", void 0);
    (0, _defineProperty2.default)(this, "exclude", void 0);
    (0, _defineProperty2.default)(this, "config", void 0);
    (0, _defineProperty2.default)(this, "format", void 0);
    this.name = name;
    this.path = normalizeRelativePath(path);
    this.include = include.map(normalizeRelativePath);
    this.exclude = [this.localeDir].concat((0, _toConsumableArray2.default)(exclude.map(normalizeRelativePath)));
    this.config = config;
    this.format = (0, _formats.default)(config.format);
  }

  (0, _createClass2.default)(Catalog, [{
    key: "make",
    value: function () {
      var _make = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee(options) {
        var nextCatalog, prevCatalogs, catalogs, cleanAndSort, sortedCatalogs;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.collect(options);

              case 2:
                nextCatalog = _context.sent;
                prevCatalogs = this.readAll();
                catalogs = this.merge(prevCatalogs, nextCatalog, {
                  overwrite: options.overwrite,
                  files: options.files
                }); // Map over all locales and post-process each catalog

                cleanAndSort = R.map(R.pipe( // Clean obsolete messages
                options.clean ? cleanObsolete : R.identity, // Sort messages
                order(options.orderBy)));
                sortedCatalogs = cleanAndSort(catalogs);

                if (options.locale) {
                  this.write(options.locale, sortedCatalogs[options.locale]);
                } else {
                  this.writeAll(sortedCatalogs);
                }

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function make(_x) {
        return _make.apply(this, arguments);
      }

      return make;
    }()
  }, {
    key: "makeTemplate",
    value: function () {
      var _makeTemplate = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2(options) {
        var catalog, sort;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.collect(options);

              case 2:
                catalog = _context2.sent;
                sort = order(options.orderBy);
                this.writeTemplate(sort(catalog));

              case 5:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function makeTemplate(_x2) {
        return _makeTemplate.apply(this, arguments);
      }

      return makeTemplate;
    }()
    /**
     * Collect messages from source paths. Return a raw message catalog as JSON.
     */

  }, {
    key: "collect",
    value: function () {
      var _collect = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee3(options) {
        var tmpDir, paths, regex, _iterator, _step, filename;

        return _regenerator.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                tmpDir = _path.default.join(_os.default.tmpdir(), "lingui-".concat(process.pid));

                if (_fsExtra.default.existsSync(tmpDir)) {
                  (0, _utils.removeDirectory)(tmpDir, true);
                } else {
                  _fsExtra.default.mkdirSync(tmpDir);
                }

                _context3.prev = 2;
                paths = this.sourcePaths;

                if (options.files) {
                  options.files = options.files.map(function (p) {
                    return (0, _normalizePath.default)(p, false);
                  });
                  regex = new RegExp(options.files.join("|"), "i");
                  paths = paths.filter(function (path) {
                    return regex.test(path);
                  });
                }

                _iterator = _createForOfIteratorHelper(paths);
                _context3.prev = 6;

                _iterator.s();

              case 8:
                if ((_step = _iterator.n()).done) {
                  _context3.next = 14;
                  break;
                }

                filename = _step.value;
                _context3.next = 12;
                return (0, _extractors.default)(filename, tmpDir, {
                  verbose: options.verbose,
                  configPath: options.configPath,
                  babelOptions: this.config.extractBabelOptions,
                  extractors: options.extractors,
                  projectType: options.projectType
                });

              case 12:
                _context3.next = 8;
                break;

              case 14:
                _context3.next = 19;
                break;

              case 16:
                _context3.prev = 16;
                _context3.t0 = _context3["catch"](6);

                _iterator.e(_context3.t0);

              case 19:
                _context3.prev = 19;

                _iterator.f();

                return _context3.finish(19);

              case 22:
                return _context3.abrupt("return", function traverse(directory) {
                  return _fsExtra.default.readdirSync(directory).map(function (filename) {
                    var filepath = _path.default.join(directory, filename);

                    if (_fsExtra.default.lstatSync(filepath).isDirectory()) {
                      return traverse(filepath);
                    }

                    if (!filename.endsWith(".json")) return;

                    try {
                      return JSON.parse(_fsExtra.default.readFileSync(filepath).toString());
                    } catch (e) {}
                  }).filter(Boolean).reduce(function (catalog, messages) {
                    return R.mergeWithKey(mergeOriginsAndExtractedComments, catalog, messages);
                  }, {});
                }(tmpDir));

              case 25:
                _context3.prev = 25;
                _context3.t1 = _context3["catch"](2);
                throw _context3.t1;

              case 28:
                _context3.prev = 28;
                (0, _utils.removeDirectory)(tmpDir);
                return _context3.finish(28);

              case 31:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[2, 25, 28, 31], [6, 16, 19, 22]]);
      }));

      function collect(_x3) {
        return _collect.apply(this, arguments);
      }

      return collect;
    }()
  }, {
    key: "merge",
    value: function merge(prevCatalogs, nextCatalog, options) {
      var _this = this;

      var nextKeys = R.keys(nextCatalog).map(String);
      return R.mapObjIndexed(function (prevCatalog, locale) {
        var prevKeys = R.keys(prevCatalog).map(String);
        var newKeys = R.difference(nextKeys, prevKeys);
        var mergeKeys = R.intersection(nextKeys, prevKeys);
        var obsoleteKeys = R.difference(prevKeys, nextKeys); // Initialize new catalog with new keys

        var newMessages = R.mapObjIndexed(function (message, key) {
          return _objectSpread({
            translation: _this.config.sourceLocale === locale ? message.message || key : ""
          }, message);
        }, R.pick(newKeys, nextCatalog)); // Merge translations from previous catalog

        var mergedMessages = mergeKeys.map(function (key) {
          var updateFromDefaults = _this.config.sourceLocale === locale && (prevCatalog[key].translation === prevCatalog[key].message || options.overwrite);
          var translation = updateFromDefaults ? nextCatalog[key].message : prevCatalog[key].translation;
          return (0, _defineProperty2.default)({}, key, _objectSpread({
            translation: translation
          }, R.omit(["obsolete, translation"], nextCatalog[key])));
        }); // Mark all remaining translations as obsolete
        // Only if *options.files* is not provided

        var obsoleteMessages = obsoleteKeys.map(function (key) {
          return (0, _defineProperty2.default)({}, key, _objectSpread(_objectSpread({}, prevCatalog[key]), {}, {
            obsolete: options.files ? false : true
          }));
        });
        return R.mergeAll([newMessages].concat((0, _toConsumableArray2.default)(mergedMessages), (0, _toConsumableArray2.default)(obsoleteMessages)));
      }, prevCatalogs);
    }
  }, {
    key: "getTranslations",
    value: function getTranslations(locale, options) {
      var _this2 = this;

      var catalogs = this.readAll();
      return R.mapObjIndexed(function (_value, key) {
        return _this2.getTranslation(catalogs, locale, key, options);
      }, catalogs[locale]);
    }
  }, {
    key: "getTranslation",
    value: function getTranslation(catalogs, locale, key, _ref4) {
      var _this3 = this;

      var fallbackLocales = _ref4.fallbackLocales,
          sourceLocale = _ref4.sourceLocale;

      if (!catalogs[locale].hasOwnProperty(key)) {
        console.error("Message with key ".concat(key, " is missing in locale ").concat(locale));
      }

      var getTranslation = function getTranslation(locale) {
        var configLocales = _this3.config.locales.join('", "');

        var localeCatalog = catalogs[locale];

        if (!localeCatalog) {
          console.warn("\n        Catalog \"".concat(locale, "\" isn't present in locales config parameter\n        Add \"").concat(locale, "\" to your lingui.config.js:\n        {\n          locales: [\"").concat(configLocales, "\", \"").concat(locale, "\"]\n        }\n      "));
          return null;
        }

        if (!localeCatalog.hasOwnProperty(key)) {
          console.error("Message with key ".concat(key, " is missing in locale ").concat(locale));
          return null;
        }

        if (catalogs[locale]) {
          return catalogs[locale][key].translation;
        }

        return null;
      };

      var getMultipleFallbacks = function getMultipleFallbacks(locale) {
        var fL = fallbackLocales && fallbackLocales[locale]; // some probably the fallback will be undefined, so just search by locale

        if (!fL) return null;

        if (Array.isArray(fL)) {
          var _iterator2 = _createForOfIteratorHelper(fL),
              _step2;

          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var fallbackLocale = _step2.value;

              if (catalogs[fallbackLocale]) {
                return getTranslation(fallbackLocale);
              }
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
        } else {
          return getTranslation(fL);
        }
      };

      return (// Get translation in target locale
        getTranslation(locale) || // We search in fallbackLocales as dependent of each locale
        getMultipleFallbacks(locale) || // Get translation in fallbackLocales.default (if any)
        fallbackLocales && fallbackLocales.default && getTranslation(fallbackLocales.default) || // Get message default
        catalogs[locale][key].defaults || // If sourceLocale is either target locale of fallback one, use key
        sourceLocale && sourceLocale === locale && key || sourceLocale && fallbackLocales.default && sourceLocale === fallbackLocales.default && key || // Otherwise no translation is available
        undefined
      );
    }
  }, {
    key: "write",
    value: function write(locale, messages) {
      var filename = this.path.replace(LOCALE, locale) + this.format.catalogExtension;
      var created = !_fsExtra.default.existsSync(filename);

      var basedir = _path.default.dirname(filename);

      if (!_fsExtra.default.existsSync(basedir)) {
        _fsExtra.default.mkdirpSync(basedir);
      }

      var options = _objectSpread(_objectSpread({}, this.config.formatOptions), {}, {
        locale: locale
      });

      this.format.write(filename, messages, options);
      return [created, filename];
    }
  }, {
    key: "writeAll",
    value: function writeAll(catalogs) {
      var _this4 = this;

      this.locales.forEach(function (locale) {
        return _this4.write(locale, catalogs[locale]);
      });
    }
  }, {
    key: "writeTemplate",
    value: function writeTemplate(messages) {
      var filename = this.templateFile;

      var basedir = _path.default.dirname(filename);

      if (!_fsExtra.default.existsSync(basedir)) {
        _fsExtra.default.mkdirpSync(basedir);
      }

      var options = _objectSpread(_objectSpread({}, this.config.formatOptions), {}, {
        locale: undefined
      });

      this.format.write(filename, messages, options);
    }
  }, {
    key: "writeCompiled",
    value: function writeCompiled(locale, compiledCatalog, namespace) {
      var ext;

      if (namespace === "es") {
        ext = "mjs";
      } else if (namespace === "ts") {
        ext = "ts";
      } else {
        ext = "js";
      }

      var filename = "".concat(this.path.replace(LOCALE, locale), ".").concat(ext);

      var basedir = _path.default.dirname(filename);

      if (!_fsExtra.default.existsSync(basedir)) {
        _fsExtra.default.mkdirpSync(basedir);
      }

      _fsExtra.default.writeFileSync(filename, compiledCatalog);

      return filename;
    }
  }, {
    key: "read",
    value: function read(locale) {
      var filename = this.path.replace(LOCALE, locale) + this.format.catalogExtension;
      if (!_fsExtra.default.existsSync(filename)) return null;
      return this.format.read(filename);
    }
  }, {
    key: "readAll",
    value: function readAll() {
      var _this5 = this;

      return R.mergeAll(this.locales.map(function (locale) {
        return (0, _defineProperty2.default)({}, locale, _this5.read(locale));
      }));
    }
  }, {
    key: "readTemplate",
    value: function readTemplate() {
      var filename = this.templateFile;
      if (!_fsExtra.default.existsSync(filename)) return null;
      return this.format.read(filename);
    }
  }, {
    key: "sourcePaths",
    get: function get() {
      var includeGlobs = this.include.map(function (includePath) {
        var isDir = _fsExtra.default.existsSync(includePath) && _fsExtra.default.lstatSync(includePath).isDirectory();
        /**
         * glob library results from absolute patterns such as /foo/* are mounted onto the root setting using path.join.
         * On windows, this will by default result in /foo/* matching C:\foo\bar.txt.
         */


        return isDir ? (0, _normalizePath.default)(_path.default.resolve(process.cwd(), includePath === "/" ? "" : includePath, "**/*.*")) : includePath;
      });
      var patterns = includeGlobs.length > 1 ? "{".concat(includeGlobs.join(","), "}") : includeGlobs[0];
      return _glob.default.sync(patterns, {
        ignore: this.exclude,
        mark: true
      });
    }
  }, {
    key: "templateFile",
    get: function get() {
      return this.path.replace(LOCALE_SUFFIX_RE, "messages.pot");
    }
  }, {
    key: "localeDir",
    get: function get() {
      var localePatternIndex = this.path.indexOf(LOCALE);

      if (localePatternIndex === -1) {
        throw Error("Invalid catalog path: ".concat(LOCALE, " variable is missing"));
      }

      return this.path.substr(0, localePatternIndex);
    }
  }, {
    key: "locales",
    get: function get() {
      return this.config.locales;
    }
  }]);
  return Catalog;
}();
/**
 * Parse `config.catalogs` and return a list of configured Catalog instances.
 */


exports.Catalog = Catalog;

function getCatalogs(config) {
  var catalogsConfig = config.catalogs;
  var catalogs = [];
  catalogsConfig.forEach(function (catalog) {
    // Validate that `catalogPath` doesn't end with trailing slash
    if (catalog.path.endsWith(PATHSEP)) {
      var extension = (0, _formats.default)(config.format).catalogExtension;
      var correctPath = catalog.path.slice(0, -1);
      var examplePath = correctPath.replace(LOCALE, // Show example using one of configured locales (if any)
      (config.locales || [])[0] || "en") + extension;
      throw new Error( // prettier-ignore
      "Remove trailing slash from \"".concat(catalog.path, "\". Catalog path isn't a directory,") + " but translation file without extension. For example, catalog path \"".concat(correctPath, "\"") + " results in translation file \"".concat(examplePath, "\"."));
    }

    var include = ensureArray(catalog.include).map(normalizeRelativePath);
    var exclude = ensureArray(catalog.exclude).map(normalizeRelativePath); // catalog.path without {name} pattern -> always refers to a single catalog

    if (!catalog.path.includes(NAME)) {
      // Validate that sourcePaths doesn't use {name} pattern either
      var invalidSource = include.find(function (path) {
        return path.includes(NAME);
      });

      if (invalidSource !== undefined) {
        throw new Error("Catalog with path \"".concat(catalog.path, "\" doesn't have a {name} pattern") + " in it, but one of source directories uses it: \"".concat(invalidSource, "\".") + " Either add {name} pattern to \"".concat(catalog.path, "\" or remove it") + " from all source directories.");
      } // catalog name is the last directory of catalog.path.
      // If the last part is {locale}, then catalog doesn't have an explicit name


      var name = function () {
        var _name = catalog.path.split(PATHSEP).slice(-1)[0];
        return _name !== LOCALE ? _name : null;
      }();

      catalogs.push(new Catalog({
        name: name,
        path: normalizeRelativePath(catalog.path),
        include: include,
        exclude: exclude
      }, config));
      return;
    }

    var patterns = include.map(function (path) {
      return path.replace(NAME, "*");
    });

    var candidates = _glob.default.sync(patterns.length > 1 ? "{".concat(patterns.join(","), "}") : patterns[0], {
      ignore: exclude,
      mark: true
    });

    candidates.forEach(function (catalogDir) {
      var name = _path.default.basename(catalogDir);

      catalogs.push(new Catalog({
        name: name,
        path: normalizeRelativePath(catalog.path.replace(NAME, name)),
        include: include.map(function (path) {
          return path.replace(NAME, name);
        }),
        exclude: exclude.map(function (path) {
          return path.replace(NAME, name);
        })
      }, config));
    });
  });
  return catalogs;
}

function getCatalogForFile(file, catalogs) {
  var _iterator3 = _createForOfIteratorHelper(catalogs),
      _step3;

  try {
    for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
      var _catalog = _step3.value;
      var catalogFile = "".concat(_catalog.path).concat(_catalog.format.catalogExtension);
      var catalogGlob = catalogFile.replace(LOCALE, "*");

      var match = _micromatch.default.capture(normalizeRelativePath(_path.default.relative(_catalog.config.rootDir, catalogGlob)), normalizeRelativePath(file));

      if (match) {
        return {
          locale: match[0],
          catalog: _catalog
        };
      }
    }
  } catch (err) {
    _iterator3.e(err);
  } finally {
    _iterator3.f();
  }

  return null;
}
/**
 * Create catalog for merged messages.
 */


function getCatalogForMerge(config) {
  var catalogConfig = config;

  if (catalogConfig.catalogsMergePath.endsWith(PATHSEP)) {
    var extension = (0, _formats.default)(config.format).catalogExtension;
    var correctPath = catalogConfig.catalogsMergePath.slice(0, -1);
    var examplePath = correctPath.replace(LOCALE, // Show example using one of configured locales (if any)
    (config.locales || [])[0] || "en") + extension;
    throw new Error( // prettier-ignore
    "Remove trailing slash from \"".concat(catalogConfig.catalogsMergePath, "\". Catalog path isn't a directory,") + " but translation file without extension. For example, catalog path \"".concat(correctPath, "\"") + " results in translation file \"".concat(examplePath, "\"."));
  } // catalog name is the last directory of catalogPath.
  // If the last part is {locale}, then catalog doesn't have an explicit name


  var name = function () {
    var _name = _path.default.basename(normalizeRelativePath(catalogConfig.catalogsMergePath));

    return _name !== LOCALE ? _name : null;
  }();

  var catalog = new Catalog({
    name: name,
    path: normalizeRelativePath(catalogConfig.catalogsMergePath),
    include: [],
    exclude: []
  }, config);
  return catalog;
}
/**
 * Merge origins and extractedComments for messages found in different places. All other attributes
 * should be the same (raise an error if defaults are different).
 */


function mergeOriginsAndExtractedComments(msgId, prev, next) {
  if (prev.defaults !== next.defaults) {
    throw new Error("Encountered different defaults for message ".concat(_chalk.default.yellow(msgId)) + "\n".concat(_chalk.default.yellow((0, _utils.prettyOrigin)(prev.origin)), " ").concat(prev.defaults) + "\n".concat(_chalk.default.yellow((0, _utils.prettyOrigin)(next.origin)), " ").concat(next.defaults));
  }

  return _objectSpread(_objectSpread({}, next), {}, {
    extractedComments: R.concat(prev.extractedComments, next.extractedComments),
    origin: R.concat(prev.origin, next.origin)
  });
}
/**
 * Ensure that value is always array. If not, turn it into an array of one element.
 */


var ensureArray = function ensureArray(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
};
/**
 * Remove ./ at the beginning: ./relative  => relative
 *                             relative    => relative
 * Preserve directories:       ./relative/ => relative/
 * Preserve absolute paths:    /absolute/path => /absolute/path
 */


function normalizeRelativePath(sourcePath) {
  if (_path.default.isAbsolute(sourcePath)) {
    // absolute path
    return (0, _normalizePath.default)(sourcePath, false);
  }

  var isDir = _fsExtra.default.existsSync(sourcePath) && _fsExtra.default.lstatSync(sourcePath).isDirectory();

  return (0, _normalizePath.default)(_path.default.relative(process.cwd(), sourcePath), false) + (isDir ? "/" : "");
}

var cleanObsolete = R.filter(function (message) {
  return !message.obsolete;
});
exports.cleanObsolete = cleanObsolete;

function order(by) {
  return {
    messageId: orderByMessageId,
    origin: orderByOrigin
  }[by];
}
/**
 * Object keys are in the same order as they were created
 * https://stackoverflow.com/a/31102605/1535540
 */


function orderByMessageId(messages) {
  var orderedMessages = {};
  Object.keys(messages).sort().forEach(function (key) {
    orderedMessages[key] = messages[key];
  });
  return orderedMessages;
}

function orderByOrigin(messages) {
  function getFirstOrigin(messageKey) {
    var sortedOrigins = messages[messageKey].origin.sort(function (a, b) {
      if (a[0] < b[0]) return -1;
      if (a[0] > b[0]) return 1;
      return 0;
    });
    return sortedOrigins[0];
  }

  return Object.keys(messages).sort(function (a, b) {
    var _getFirstOrigin = getFirstOrigin(a),
        _getFirstOrigin2 = (0, _slicedToArray2.default)(_getFirstOrigin, 2),
        aFile = _getFirstOrigin2[0],
        aLineNumber = _getFirstOrigin2[1];

    var _getFirstOrigin3 = getFirstOrigin(b),
        _getFirstOrigin4 = (0, _slicedToArray2.default)(_getFirstOrigin3, 2),
        bFile = _getFirstOrigin4[0],
        bLineNumber = _getFirstOrigin4[1];

    if (aFile < bFile) return -1;
    if (aFile > bFile) return 1;
    if (aLineNumber < bLineNumber) return -1;
    if (aLineNumber > bLineNumber) return 1;
    return 0;
  }).reduce(function (acc, key) {
    acc[key] = messages[key];
    return acc;
  }, {});
}