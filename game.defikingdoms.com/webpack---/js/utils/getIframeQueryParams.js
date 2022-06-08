"use strict";
'use es6';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getIframeQueryParams = getIframeQueryParams;

var _operators = require("../cookies/operators");

var _whichDevice = require("./whichDevice");

var _isEmbeddedInProduct = require("./isEmbeddedInProduct");

var _shouldHideWelcomeMessage = require("./shouldHideWelcomeMessage");

var _shouldWidgetStartOpen = require("./shouldWidgetStartOpen");

var _settingsHelpers = require("../external-api/settingsHelpers");

function getIframeQueryParams({
  messagesUtk,
  hubspotUtk,
  portalId,
  iframeUuid,
  globalCookieOptOut,
  isFirstVisitorSession,
  hstc,
  isInCMS
}) {
  const mobile = (0, _whichDevice.isAnyMobile)();
  const inline = (0, _settingsHelpers.shouldEmbedInline)();
  const startOpen = (0, _shouldWidgetStartOpen.shouldWidgetStartOpen)();
  const queryParams = {
    uuid: iframeUuid,
    mobile,
    mobileSafari: (0, _whichDevice.isMobileSafari)(),
    hideWelcomeMessage: (0, _shouldHideWelcomeMessage.shouldHideWelcomeMessage)(),
    hstc,
    domain: (0, _operators.getHostnameWithoutWww)(),
    inApp53: (0, _isEmbeddedInProduct.isEmbeddedInProduct)({
      portalId
    }),
    messagesUtk,
    url: encodeURIComponent(window.location.href),
    inline,
    isFullscreen: (0, _settingsHelpers.shouldBeFullscreen)(),
    globalCookieOptOut,
    isFirstVisitorSession,
    isAttachmentDisabled: (0, _settingsHelpers.shouldDisableAttachment)(),
    enableWidgetCookieBanner: (0, _settingsHelpers.getEnableWidgetCookieBanner)(),
    isInCMS
  };

  if (typeof startOpen !== 'undefined') {
    queryParams['startOpen'] = startOpen;
  }

  if (hubspotUtk) {
    queryParams['hubspotUtk'] = hubspotUtk;
  }

  return queryParams;
}