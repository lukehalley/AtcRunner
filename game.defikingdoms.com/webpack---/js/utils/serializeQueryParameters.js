"use strict";
'use es6';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.serializeQueryParameters = serializeQueryParameters;

function serializeQueryParameters(params) {
  return Object.keys(params).reduce((paramsArray, key) => {
    paramsArray.push(`${key}=${params[key]}`);
    return paramsArray;
  }, []).join('&');
}