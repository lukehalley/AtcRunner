"use strict";
'use es6';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _passiveEventListenerSupported = require("./util/passiveEventListenerSupported");

var _getBodyScrollTop = require("./util/getBodyScrollTop");

var _getViewportHeight = require("./util/getViewportHeight");

var _getPageHeight = require("./util/getPageHeight");

var _receivedPostMessageTypes = require("../iframe-communication/constants/receivedPostMessageTypes");

class ScrollPercentageTracker {
  constructor({
    onScroll
  }) {
    this._onScroll = onScroll;
    this._handleScroll = this._handleScroll.bind(this);
    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
  }

  _handleScroll() {
    const pageHeightAndViewportDifference = (0, _getPageHeight.getPageHeight)() - (0, _getViewportHeight.getViewportHeight)();

    if (pageHeightAndViewportDifference === 0) {
      return;
    }

    const scrollPercentage = 100 * (0, _getBodyScrollTop.getBodyScrollTop)() / pageHeightAndViewportDifference;

    this._onScroll({
      scrollPercentage
    });
  }

  _add() {
    const useCapture = true;

    if ((0, _passiveEventListenerSupported.passiveEventListenerSupported)()) {
      window.addEventListener('scroll', this._handleScroll, {
        capture: useCapture,
        passive: true
      });
    } else {
      window.addEventListener('scroll', this._handleScroll, useCapture);
    }
  }

  add() {
    this.remove();

    this._add();
  }

  remove() {
    const useCapture = true;

    if ((0, _passiveEventListenerSupported.passiveEventListenerSupported)()) {
      window.removeEventListener('scroll', this._handleScroll, {
        capture: useCapture,
        passive: true
      });
    } else {
      window.removeEventListener('scroll', this._handleScroll, useCapture);
    }
  }

  registerPostMessageReceivers(postMessageReceiver) {
    postMessageReceiver.register(_receivedPostMessageTypes.START_TRACK_SCROLL_PERCENTAGE, this.add);
    postMessageReceiver.register(_receivedPostMessageTypes.STOP_TRACK_SCROLL_PERCENTAGE, this.remove);
  }

}

var _default = ScrollPercentageTracker;
exports.default = _default;
module.exports = exports.default;