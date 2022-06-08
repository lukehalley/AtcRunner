"use strict";
'use es6';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flushOnReadyCallbacks = flushOnReadyCallbacks;

var _constants = require("./constants");

function flushOnReadyCallbacks({
  logger,
  trackCallback
}) {
  const callbacks = window[_constants.ON_READY_CALLBACKS];

  if (Array.isArray(callbacks)) {
    if (trackCallback) trackCallback();
    callbacks.forEach(cb => {
      try {
        cb();
      } catch (err) {
        logger.error(err.message);
      }
    });
  }
}