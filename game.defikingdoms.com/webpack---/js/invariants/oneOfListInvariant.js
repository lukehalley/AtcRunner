"use strict";
'use es6';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.oneOfListInvariant = void 0;

var _invariant = _interopRequireDefault(require("../utils/invariant"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const oneOfListInvariant = (potentialVar, potentialVarName, listOfOptions) => (0, _invariant.default)(listOfOptions.indexOf(potentialVar) > -1, `Expected %s to be one of ${listOfOptions.toString()} but got %s`, potentialVarName, potentialVar);

exports.oneOfListInvariant = oneOfListInvariant;