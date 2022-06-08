"use strict";
'use es6';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.numberInvariant = void 0;

var _invariant = _interopRequireDefault(require("../utils/invariant"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const numberInvariant = (potentialNumber, numberName = '') => (0, _invariant.default)(typeof potentialNumber === 'number', 'Expected %s to be a number, not a %s', numberName || potentialNumber, typeof potentialNumber);

exports.numberInvariant = numberInvariant;