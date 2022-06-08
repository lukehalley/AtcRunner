"use strict";
'use es6';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.urlHasHsChatHashLink = void 0;
const HS_CHAT_PARAM = '#hs-chat-open';
const chatHashUrlRegex = new RegExp(`${HS_CHAT_PARAM}`, 'i');

const urlHasHsChatHashLink = url => {
  return chatHashUrlRegex.test(url);
};

exports.urlHasHsChatHashLink = urlHasHsChatHashLink;