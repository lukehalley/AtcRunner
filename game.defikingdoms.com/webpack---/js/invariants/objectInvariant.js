"use strict";
'use es6';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.objectInvariant = void 0;

var _invariant = _interopRequireDefault(require("../utils/invariant"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const objectInvariant = (potentialObject, objectName = '') => (0, _invariant.default)(typeof potentialObject === 'object' && potentialObject !== null, `Expected %s to be an object`, objectName || potentialObject);

exports.objectInvariant = objectInvariant;