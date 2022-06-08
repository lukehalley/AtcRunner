"use strict";
'use es6';
/* eslint-disable no-console */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.warn = warn;

function warn(message) {
  if (window.console) {
    console.warn(message);
  }
}