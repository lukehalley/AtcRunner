"use strict";
'use es6';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMobileState = getMobileState;
exports.isAnyMobile = isAnyMobile;
exports.isMobileSafari = isMobileSafari;
exports.isWindowsMobile = isWindowsMobile;
exports.isOperaMini = isOperaMini;
exports.isIE10 = isIE10;
exports.isIE11 = isIE11;

var _isMobile = _interopRequireDefault(require("ismobilejs/isMobile"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import-eslint-disable-line
const webkit = /WebKit/i;

function match(regex, userAgent) {
  return regex.test(userAgent);
}

function getMobileState(userAgent = navigator.userAgent) {
  let ua = userAgent; // Facebook mobile app's integrated browser adds a bunch of strings that
  // match everything. Strip it out if it exists.

  let tmp = ua.split('[FBAN');

  if (typeof tmp[1] !== 'undefined') {
    ua = tmp[0];
  }

  tmp = ua.split('Twitter');

  if (typeof tmp[1] !== 'undefined') {
    ua = tmp[0];
  }

  const isMobileInstance = new _isMobile.default.Class(ua);
  isMobileInstance.other.webkit = match(webkit, ua);
  isMobileInstance.safari = isMobileInstance.apple.device && isMobileInstance.other.webkit && !isMobileInstance.other.opera && !isMobileInstance.other.chrome;
  return isMobileInstance;
}

function isAnyMobile() {
  const mobileState = getMobileState(); // any includes things that are not included in phone ie 7 inch and 'other'
  // tablet isn only known tablets ipad, android tablet, and windows tablet
  // this logic will make sure are more likely to fall back to mobile than the desktop experience
  // if we do no know the device

  return mobileState.any && !mobileState.tablet;
}

function isMobileSafari() {
  return getMobileState().safari;
}

function isWindowsMobile() {
  return getMobileState().windows.phone;
}

function isOperaMini() {
  return getMobileState().other.opera;
}

function isIE10() {
  const ua = window.navigator.userAgent;
  const msie = ua.indexOf('MSIE ');

  if (msie > 0) {
    // IE 10 or older => return version number
    return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
  }

  return false;
}

function isIE11() {
  const ua = window.navigator.userAgent;
  const ie11 = ua.indexOf('Trident/');
  return ie11 > 0;
}