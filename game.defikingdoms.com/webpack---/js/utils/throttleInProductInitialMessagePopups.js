"use strict";
'use es6';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.throttleInProductInitialMessagePopups = throttleInProductInitialMessagePopups;

var _operators = require("../cookies/operators");

var _constants = require("../cookies/constants");

var _times = _interopRequireDefault(require("../cookies/times"));

var _isEmbeddedInProduct = require("./isEmbeddedInProduct");

var _shouldHideWelcomeMessage = require("./shouldHideWelcomeMessage");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function throttleInProductInitialMessagePopups({
  portalId
}) {
  if ((0, _isEmbeddedInProduct.isEmbeddedInProduct)({
    portalId
  }) && !(0, _shouldHideWelcomeMessage.shouldHideWelcomeMessage)()) {
    (0, _operators.setCookie)(_constants.cookies.HIDE_WELCOME_MESSAGE, true, _times.default.ONE_DAY);
  }
}