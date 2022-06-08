"use strict";
'use es6';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.passiveEventListenerSupported = void 0;

const passiveEventListenerSupported = () => {
  let passiveSupported = false;

  try {
    const options = {
      // This function will be called when the browser
      // attempts to access the passive property.
      get passive() {
        passiveSupported = true;
      }

    };
    window.addEventListener('test', options, options);
    window.removeEventListener('test', options, options);
  } catch (err) {
    passiveSupported = false;
  }

  return passiveSupported;
};

exports.passiveEventListenerSupported = passiveEventListenerSupported;