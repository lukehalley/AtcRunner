"use strict";
'use es6';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.eventTypeInvariant = void 0;

var _invariant = _interopRequireDefault(require("../../utils/invariant"));

var eventTypeConstants = _interopRequireWildcard(require("../constants/eventTypeConstants"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const eventTypeValues = Object.keys(eventTypeConstants).map(key => eventTypeConstants[key]);

const eventTypeInvariant = potentialEventType => (0, _invariant.default)(eventTypeValues.indexOf(potentialEventType) !== -1, 'Expected a valid event type but received %s. Valid event types include %s.', potentialEventType, eventTypeValues);

exports.eventTypeInvariant = eventTypeInvariant;