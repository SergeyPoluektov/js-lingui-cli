"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _fs = _interopRequireDefault(require("fs"));

var _papaparse = _interopRequireDefault(require("papaparse"));

var _utils = require("../utils");

var serialize = function serialize(catalog) {
  var rawArr = Object.keys(catalog).map(function (key) {
    return [key, catalog[key].translation];
  });
  return _papaparse.default.unparse(rawArr);
};

var deserialize = function deserialize(raw) {
  var rawCatalog = _papaparse.default.parse(raw);

  var messages = {};

  if (rawCatalog.errors.length) {
    throw new Error(rawCatalog.errors.map(function (err) {
      return JSON.stringify(err);
    }).join(";"));
  }

  rawCatalog.data.forEach(function (_ref) {
    var _ref2 = (0, _slicedToArray2.default)(_ref, 2),
        key = _ref2[0],
        translation = _ref2[1];

    messages[key] = {
      translation: translation,
      obsolete: false,
      message: null,
      origin: []
    };
  });
  return messages;
};

var csv = {
  catalogExtension: ".csv",
  write: function write(filename, catalog) {
    var messages = serialize(catalog);
    (0, _utils.writeFileIfChanged)(filename, messages);
  },
  read: function read(filename) {
    var raw = _fs.default.readFileSync(filename).toString();

    try {
      return deserialize(raw);
    } catch (e) {
      throw new Error("Cannot read ".concat(filename, ": ").concat(e.message));
    }
  },
  parse: function parse(content) {
    return deserialize(content);
  }
};
var _default = csv;
exports.default = _default;