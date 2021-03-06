"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _fs = _interopRequireDefault(require("fs"));

var R = _interopRequireWildcard(require("ramda"));

var _dateFns = require("date-fns");

var _pofile = _interopRequireDefault(require("pofile"));

var _utils = require("../utils");

var getCreateHeaders = function getCreateHeaders() {
  var language = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "no";
  return {
    "POT-Creation-Date": (0, _dateFns.format)(new Date(), "yyyy-MM-dd HH:mmxxxx"),
    "MIME-Version": "1.0",
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Transfer-Encoding": "8bit",
    "X-Generator": "@lingui/cli",
    Language: language
  };
};

var serialize = function serialize(items, options) {
  return R.compose(R.values, R.mapObjIndexed(function (message, key) {
    var item = new _pofile.default.Item();
    item.msgid = key;
    item.msgstr = [message.translation];
    item.comments = message.comments || [];
    item.extractedComments = message.extractedComments || [];

    if (message.context) {
      item.msgctxt = message.context;
    }

    if (options.origins !== false) {
      if (message.origin && options.lineNumbers === false) {
        item.references = message.origin.map(function (_ref) {
          var _ref2 = (0, _slicedToArray2.default)(_ref, 1),
              path = _ref2[0];

          return path;
        });
      } else {
        item.references = message.origin ? message.origin.map(_utils.joinOrigin) : [];
      }
    } // @ts-ignore: Figure out how to set this flag


    item.obsolete = message.obsolete;
    item.flags = message.flags ? R.fromPairs(message.flags.map(function (flag) {
      return [flag, true];
    })) : {};
    return item;
  }))(items);
};

var getMessageKey = R.prop("msgid");
var getTranslations = R.prop("msgstr");
var getExtractedComments = R.prop("extractedComments");
var getTranslatorComments = R.prop("comments");
var getMessageContext = R.prop("msgctxt");
var getOrigins = R.prop("references");
var getFlags = R.compose(R.map(R.trim), R.keys, R.dissoc("obsolete"), // backward-compatibility, remove in 3.x
R.prop("flags"));
var isObsolete = R.either(R.path(["flags", "obsolete"]), R.prop("obsolete"));
var deserialize = R.map(R.applySpec({
  translation: R.compose(R.head, R.defaultTo([]), getTranslations),
  extractedComments: R.compose(R.defaultTo([]), getExtractedComments),
  comments: R.compose(R.defaultTo([]), getTranslatorComments),
  context: R.compose(R.defaultTo(null), getMessageContext),
  obsolete: isObsolete,
  origin: R.compose(R.map(_utils.splitOrigin), R.defaultTo([]), getOrigins),
  flags: getFlags
}));
var validateItems = R.forEach(function (item) {
  if (R.length(getTranslations(item)) > 1) {
    console.warn("Multiple translations for item with key %s is not supported and it will be ignored.", getMessageKey(item));
  }
});
var indexItems = R.indexBy(getMessageKey);
var po = {
  catalogExtension: ".po",
  write: function write(filename, catalog, options) {
    var po;

    if (_fs.default.existsSync(filename)) {
      var _raw = _fs.default.readFileSync(filename).toString();

      po = _pofile.default.parse(_raw);
    } else {
      po = new _pofile.default();
      po.headers = getCreateHeaders(options.locale);

      if (options.locale === undefined) {
        delete po.headers.Language;
      }

      po.headerOrder = R.keys(po.headers);
    }

    po.items = serialize(catalog, options);
    (0, _utils.writeFileIfChanged)(filename, po.toString());
  },
  read: function read(filename) {
    var raw = _fs.default.readFileSync(filename).toString();

    return this.parse(raw);
  },
  parse: function parse(raw) {
    var po = _pofile.default.parse(raw);

    validateItems(po.items);
    return deserialize(indexItems(po.items));
  }
};
var _default = po;
exports.default = _default;