"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _dateFns = require("date-fns");

var _fs = _interopRequireDefault(require("fs"));

var _messageformatParser = _interopRequireDefault(require("messageformat-parser"));

var _pluralsCldr = _interopRequireDefault(require("plurals-cldr"));

var _pofile = _interopRequireDefault(require("pofile"));

var R = _interopRequireWildcard(require("ramda"));

var _plurals = _interopRequireDefault(require("node-gettext/lib/plurals"));

var _utils = require("../utils");

function getCreateHeaders() {
  var language = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "no";
  return {
    "POT-Creation-Date": (0, _dateFns.format)(new Date(), "yyyy-MM-dd HH:mmxxxx"),
    "MIME-Version": "1.0",
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Transfer-Encoding": "8bit",
    "X-Generator": "@lingui/cli",
    Language: language
  };
} // Attempts to turn a single tokenized ICU plural case back into a string.


function stringifyICUCase(icuCase) {
  return icuCase.tokens.map(function (token) {
    if (typeof token === "string") {
      return token;
    } else if (token.type === "octothorpe") {
      return "#";
    } else if (token.type === "argument") {
      return "{" + token.arg + "}";
    } else {
      console.warn("Unexpected token \"".concat(token, "\" while stringifying plural case \"").concat(icuCase, "\". Token will be ignored."));
      return "";
    }
  }).join("");
}

var ICU_PLURAL_REGEX = /^{.*, plural, .*}$/;
var ICU_SELECT_REGEX = /^{.*, select(Ordinal)?, .*}$/;
var LINE_ENDINGS = /\r?\n/g; // Prefix that is used to identitify context information used by this module in PO's "extracted comments".

var CTX_PREFIX = "js-lingui:";

var serialize = function serialize(items, options) {
  return R.compose(R.values, R.mapObjIndexed(function (message, key) {
    var _message$extractedCom;

    var item = new _pofile.default.Item();
    item.msgid = key;
    item.comments = message.comments || []; // The extractedComments array may be modified in this method, so create a new array with the message's elements.
    // Destructuring `undefined` is forbidden, so fallback to `[]` if the message has no extracted comments.

    item.extractedComments = (0, _toConsumableArray2.default)((_message$extractedCom = message.extractedComments) !== null && _message$extractedCom !== void 0 ? _message$extractedCom : []);

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
    })) : {}; // Depending on whether custom ids are used by the developer, the (potential plural) "original", untranslated ICU
    // message can be found in `message.message` or in the item's `key` itself.

    var icuMessage = message.message || key;

    var _simplifiedMessage = icuMessage.replace(LINE_ENDINGS, " "); // Quick check to see if original message is a plural localization.


    if (ICU_PLURAL_REGEX.test(_simplifiedMessage)) {
      try {
        var _message$translation;

        var _ICUParser$parse = _messageformatParser.default.parse(icuMessage),
            _ICUParser$parse2 = (0, _slicedToArray2.default)(_ICUParser$parse, 1),
            messageAst = _ICUParser$parse2[0]; // Check if any of the plural cases contain plurals themselves.


        if (messageAst.cases.some(function (icuCase) {
          return icuCase.tokens.some(function (token) {
            return token.type === "plural";
          });
        })) {
          console.warn("Nested plurals cannot be expressed with gettext plurals. " + "Message with key \"%s\" will not be saved correctly.", key);
        } // Store placeholder that is pluralized upon to allow restoring ICU format later.


        var ctx = new URLSearchParams({
          pluralize_on: messageAst.arg
        });

        if (message.message == null) {
          // For messages without developer-set ID, use first case as `msgid` and the last case as `msgid_plural`.
          // This does not necessarily make sense for development languages with more than two numbers, but gettext
          // only supports exactly two plural forms.
          item.msgid = stringifyICUCase(messageAst.cases[0]);
          item.msgid_plural = stringifyICUCase(messageAst.cases[messageAst.cases.length - 1]); // Since the original msgid is overwritten, store ICU message to allow restoring that ID later.

          ctx.set("icu", key);
        } else {
          // For messages with developer-set ID, append `_plural` to the key to generate `msgid_plural`.
          item.msgid_plural = key + "_plural";
        }

        ctx.sort();
        item.extractedComments.push(CTX_PREFIX + ctx.toString()); // If there is a translated value, parse that instead of the original message to prevent overriding localized
        // content with the original message. If there is no translated value, don't touch msgstr, since marking item as
        // plural (above) already causes `pofile` to automatically generate `msgstr[0]` and `msgstr[1]`.

        if (((_message$translation = message.translation) === null || _message$translation === void 0 ? void 0 : _message$translation.length) > 0) {
          try {
            var _ICUParser$parse3 = _messageformatParser.default.parse(message.translation),
                _ICUParser$parse4 = (0, _slicedToArray2.default)(_ICUParser$parse3, 1),
                ast = _ICUParser$parse4[0];

            if (ast.cases == null) {
              console.warn("Found translation without plural cases for key \"".concat(key, "\". ") + "This likely means that a translated .po file misses multiple msgstr[] entries for the key. " + "Translation found: \"".concat(message.translation, "\""));
              item.msgstr = [message.translation];
            } else {
              item.msgstr = ast.cases.map(stringifyICUCase);
            }
          } catch (e) {
            console.error("Error parsing translation ICU for key \"".concat(key, "\""), e);
          }
        }
      } catch (e) {
        console.error("Error parsing message ICU for key \"".concat(key, "\":"), e);
      }
    } else {
      if (!options.disableSelectWarning && ICU_SELECT_REGEX.test(_simplifiedMessage)) {
        console.warn("ICU 'select' and 'selectOrdinal' formats cannot be expressed natively in gettext format. " + "Item with key \"%s\" will be included in the catalog as raw ICU message. " + "To disable this warning, include '{ disableSelectWarning: true }' in the config's 'formatOptions'", key);
      }

      item.msgstr = [message.translation];
    }

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
var getTranslationCount = R.compose(R.length, getTranslations);
var deserialize = R.map(R.applySpec({
  translation: R.compose(R.head, R.defaultTo([]), getTranslations),
  extractedComments: R.compose(R.defaultTo([]), getExtractedComments),
  comments: R.compose(R.defaultTo([]), getTranslatorComments),
  context: R.compose(R.defaultTo(null), getMessageContext),
  obsolete: isObsolete,
  origin: R.compose(R.map(_utils.splitOrigin), R.defaultTo([]), getOrigins),
  flags: getFlags
}));
/**
 * Returns ICU case labels in the order that gettext lists localized messages, e.g. 0,1,2 => `["one", "two", "other"]`.
 *
 * Obtaining the ICU case labels for gettext-supported inputs (gettext doesn't support fractions, even though some
 * languages have a separate case for fractional numbers) works by applying the CLDR selector to the example values
 * listed in the node-gettext plurals module.
 *
 * This approach is heavily influenced by
 * https://github.com/LLK/po2icu/blob/9eb97f81f72b2fee02b77f1424702e019647e9b9/lib/po2icu.js#L148.
 */

var getPluralCases = function getPluralCases(lang) {
  // If users uses locale with underscore or slash, es-ES, es_ES, gettextplural is "es" not es-ES.
  var _lang$split = lang.split(/[-_]/g),
      _lang$split2 = (0, _slicedToArray2.default)(_lang$split, 1),
      correctLang = _lang$split2[0];

  var gettextPluralsInfo = _plurals.default[correctLang];
  return gettextPluralsInfo === null || gettextPluralsInfo === void 0 ? void 0 : gettextPluralsInfo.examples.map(function (pluralCase) {
    return (0, _pluralsCldr.default)(correctLang, pluralCase.sample);
  });
};

var convertPluralsToICU = function convertPluralsToICU(items, lang) {
  // .po plurals are numbered 0-N and need to be mapped to ICU plural classes ("one", "few", "many"...). Different
  // languages can have different plural classes (some start with "zero", some with "one"), so read that data from CLDR.
  // `pluralForms` may be `null` if lang is not found. As long as no plural is used, don't report an error.
  var pluralForms = getPluralCases(lang);
  items.forEach(function (item) {
    var _item$extractedCommen;

    var translationCount = getTranslationCount(item);
    var messageKey = getMessageKey(item); // Messages without multiple translations (= plural cases) need no further processing.

    if (translationCount <= 1 && !item.msgid_plural) {
      return;
    } // msgid_plural must be set, but its actual value is not important.


    if (!item.msgid_plural) {
      console.warn("Multiple translations for item with key \"%s\" but missing 'msgid_plural' in catalog \"".concat(lang, "\". This is not supported and the plural cases will be ignored."), messageKey);
      return;
    }

    var contextComment = (_item$extractedCommen = item.extractedComments.find(function (comment) {
      return comment.startsWith(CTX_PREFIX);
    })) === null || _item$extractedCommen === void 0 ? void 0 : _item$extractedCommen.substr(CTX_PREFIX.length);
    var ctx = new URLSearchParams(contextComment);

    if (contextComment != null) {
      item.extractedComments = item.extractedComments.filter(function (comment) {
        return !comment.startsWith(CTX_PREFIX);
      });
    } // If an original ICU was stored, use that as `msgid` to match the catalog that was originally exported.


    var storedICU = ctx.get("icu");

    if (storedICU != null) {
      item.msgid = storedICU;
    } // If all translations are empty, ignore item.


    if (item.msgstr.every(function (str) {
      return str.length === 0;
    })) {
      return;
    }

    if (pluralForms == null) {
      console.warn("Multiple translations for item with key \"%s\"\xA0in language \"".concat(lang, "\", but no plural cases were found. ") + "This prohibits the translation of .po plurals into ICU plurals. Pluralization will not work for this key.", messageKey);
      return;
    }

    var pluralCount = pluralForms.length;

    if (translationCount > pluralCount) {
      console.warn("More translations provided (".concat(translationCount, ") for item with key \"%s\" in language \"").concat(lang, "\" than there are plural cases available (").concat(pluralCount, "). ") + "This will result in not all translations getting picked up.", messageKey);
    } // Map each msgstr to a "<pluralform> {<translated_string>}" entry, joined by one space.


    var pluralClauses = item.msgstr.map(function (str, index) {
      return pluralForms[index] + " {" + str + "}";
    }).join(" "); // Find out placeholder name from item's message context, defaulting to "count".

    var pluralizeOn = ctx.get("pluralize_on");

    if (!pluralizeOn) {
      console.warn("Unable to determine plural placeholder name for item with key \"%s\" in language \"".concat(lang, "\" (should be stored in a comment starting with \"#. ").concat(CTX_PREFIX, "\"), assuming \"count\"."), messageKey);
      pluralizeOn = "count";
    }

    item.msgstr = ["{" + pluralizeOn + ", plural, " + pluralClauses + "}"];
  });
};

var indexItems = R.indexBy(getMessageKey);
var poGettext = {
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

      po.headerOrder = Object.keys(po.headers);
    }

    po.items = this.serialize(catalog, options);
    (0, _utils.writeFileIfChanged)(filename, po.toString());
  },
  // Mainly exported for easier testing
  serialize: serialize,
  read: function read(filename) {
    var raw = _fs.default.readFileSync(filename).toString();

    return this.parse(raw);
  },
  parse: function parse(raw) {
    var po = _pofile.default.parse(raw);

    convertPluralsToICU(po.items, po.headers.Language);
    return deserialize(indexItems(po.items));
  }
};
var _default = poGettext;
exports.default = _default;