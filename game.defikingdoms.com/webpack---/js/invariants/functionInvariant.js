"use strict";
'use es6';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.functionInvariant = void 0;

var _invariant = _interopRequireDefault(require("../utils/invariant"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const functionInvariant = potentialFunction => (0, _invariant.default)(typeof potentialFunction === 'function' && potentialFunction !== null, `Expected %s to be a function`, potentialFunction);

exports.functionInvariant = functionInvariant;