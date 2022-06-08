"use strict";
'use es6';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasRequiredFeatures = hasRequiredFeatures;

function hasRequiredFeatures(window) {
  const featureDetectors = [typeof window.WeakMap === 'function', typeof window.requestAnimationFrame === 'function'];
  return featureDetectors.every(featureDetector => featureDetector === true);
}