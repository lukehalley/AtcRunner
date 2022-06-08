"use strict";
'use es6';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WidgetShell = void 0;

var _whichDevice = require("./utils/whichDevice");

var _receivedPostMessageTypes = require("./iframe-communication/constants/receivedPostMessageTypes");

var _sentPostMessageTypes = require("./iframe-communication/constants/sentPostMessageTypes");

var _PostMessageReceiver = require("./iframe-communication/PostMessageReceiver");

var _pageTitleNotificationsPostMessageTypes = require("./page-title-notifications/constants/pageTitleNotificationsPostMessageTypes");

var _PageTitleNotificationsPlugin = _interopRequireDefault(require("./page-title-notifications/PageTitleNotificationsPlugin"));

var _getWidgetDataResponseType = require("./operators/getWidgetDataResponseType");

var _operators = require("./cookies/operators");

var _constants = require("./cookies/constants");

var _times = _interopRequireDefault(require("./cookies/times"));

var _clearCookies = require("./cookies/clearCookies");

var _widgetClassNames = require("./constants/widgetClassNames");

var _widgetResponseTypes = require("./constants/widgetResponseTypes");

var _setMessagesUtk = require("./utk/setMessagesUtk");

var _isEmbeddedInProduct = require("./utils/isEmbeddedInProduct");

var _shouldRenderWidget = require("./utils/shouldRenderWidget");

var _shouldWidgetStartOpen = require("./utils/shouldWidgetStartOpen");

var _elementSelectors = require("./constants/elementSelectors");

var _setupExternalApi = require("./external-api/setupExternalApi");

var _flushOnReadyCallbacks = require("./external-api/flushOnReadyCallbacks");

var _DevLogger = _interopRequireDefault(require("./external-api/DevLogger"));

var _EventEmitter = _interopRequireDefault(require("./event-emitter/EventEmitter"));

var _handleExternalApiEventMessage = require("./event-emitter/handleExternalApiEventMessage");

var _fetchWidgetData = require("./requests/fetchWidgetData");

var _events = require("./events");

var _throttle = require("./utils/throttle");

var _getIframeQueryParams = require("./utils/getIframeQueryParams");

var _settingsHelpers = require("./external-api/settingsHelpers");

var _ScrollPercentageTracker = _interopRequireDefault(require("./scroll-percentage/ScrollPercentageTracker"));

var _ExitIntentTracker = _interopRequireDefault(require("./exit-intent/ExitIntentTracker"));

var _markEnd = require("./perf/markEnd");

var _setClassInClassList = require("./operators/setClassInClassList");

var _widgetDataKeys = require("./constants/widgetDataKeys");

var _resetAndLaunchWidget = require("./utk/resetAndLaunchWidget");

var _extendedFunctions = require("./constants/extendedFunctions");

var _ApiUsageTracker = require("./external-api/ApiUsageTracker");

var _PostMessageApiClient = require("./iframe-communication/PostMessageApiClient");

var _sendWidgetDataToIframe = require("./postMessageMethods/sendWidgetDataToIframe");

var _registerCookieListeners = require("./cookies/registerCookieListeners");

var _registerHashChangeListener = require("./event-listener/registerHashChangeListener");

var _registerWindowResizeListener = require("./event-listener/registerWindowResizeListener");

var _iframeMessagePool = require("./postMessageQueue/iframeMessagePool");

var _hideWelcomeMessage = require("./utils/hideWelcomeMessage");

var _resizeWidgetIframe = require("./utils/resizeWidgetIframe");

var _handleTargetingAndDelay = require("./utils/handleTargetingAndDelay");

var _getGlobalCookieOptOut = require("./utk/getGlobalCookieOptOut");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const HELP_WIDGET_ID = 'help-widget';

const noop = () => {};

class WidgetShell {
  constructor(embedScriptContext, eventEmitter, errorLogger) {
    this.loadIFrame = () => {
      if ((0, _whichDevice.isAnyMobile)()) {
        document.documentElement.classList.add(_widgetClassNames.MOBILE);
      }

      const iframe = document.createElement('iframe');
      this.iframeSrc = this.embedScriptContext.getIFrameSrc();
      iframe.src = this.iframeSrc;
      iframe.title = 'chat widget';
      iframe.addEventListener('load', this.handleIframeLoad);
      iframe.allowFullscreen = true;
      /**
       * Inline embed
       */

      if ((0, _settingsHelpers.shouldEmbedInline)()) {
        const embedElement = document.querySelector((0, _settingsHelpers.getInlineEmbedSelector)());

        if (!embedElement) {
          this.devLogger.error(`cannot embed widget - element at \`${(0, _settingsHelpers.getInlineEmbedSelector)()}\` cannot be found`);
          return;
        }

        const parent = document.createElement('div');
        parent.id = _elementSelectors.INLINE_PARENT_ID;
        iframe.id = _elementSelectors.INLINE_IFRAME_ID;
        parent.appendChild(iframe);
        embedElement.appendChild(parent);
        return;
      }
      /**
       * Normal embed
       */


      if (!document.getElementById(_elementSelectors.PARENT_ID)) {
        const parent = document.createElement('div');
        parent.id = _elementSelectors.PARENT_ID;
        const shadowContainer = document.createElement('div');
        shadowContainer.className = _widgetClassNames.SHADOW_CONTAINER;
        const embeddedInProduct = (0, _isEmbeddedInProduct.isEmbeddedInProduct)(this.embedScriptContext);

        if (embeddedInProduct) {
          parent.classList.add(_widgetClassNames.INTERNAL);
          shadowContainer.classList.add(_widgetClassNames.INTERNAL);
        }

        parent.appendChild(shadowContainer);

        if (embeddedInProduct) {
          iframe.id = HELP_WIDGET_ID;
        }

        parent.appendChild(iframe);
        document.body.appendChild(parent);
      }

      this.setFrameClass();
    };

    this.setWidgetData = widgetData => {
      this.widgetData = widgetData;
      this.setFrameClass();
    };

    this.embedScriptContext = embedScriptContext;
    this.isOpen = (0, _shouldWidgetStartOpen.shouldWidgetStartOpen)();
    this.widgetData = null;
    this.iframeSrc = null;
    this.hasLoadedIframe = false;
    this.isLoadingIframe = false;
    this.requestWidgetOpen = this.requestWidgetOpen.bind(this);
    this.requestWidgetClose = this.requestWidgetClose.bind(this);
    this.requestWidgetRefresh = (0, _throttle.throttle)(this.requestWidgetRefresh.bind(this), 1000);
    this.handleWindowResize = this.handleWindowResize.bind(this);
    this.handleIframeLoad = this.handleIframeLoad.bind(this);
    this.handleResizeMessage = this.handleResizeMessage.bind(this);
    this.handleOpenChange = this.handleOpenChange.bind(this);
    this.handleStoreMessagesCookie = this.handleStoreMessagesCookie.bind(this);
    this.handleRequestWidget = this.handleRequestWidget.bind(this);
    this.handleWidgetRefresh = this.handleWidgetRefresh.bind(this);
    this.setWidgetNotLoaded = this.setWidgetNotLoaded.bind(this);
    this.removeIframe = this.removeIframe.bind(this);
    this.handleExternalApiEventMessage = this.handleExternalApiEventMessage.bind(this);
    this.loadWidget = (0, _throttle.throttle)(this.loadWidget.bind(this), 1000);
    this.resetAndReloadWidget = this.resetAndReloadWidget.bind(this);
    this.setWidgetOpenCookie = this.setWidgetOpenCookie.bind(this);
    this.getStatus = this.getStatus.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.handleExitIntent = this.handleExitIntent.bind(this);
    this.extendedClearCookiesFunction = this.extendedClearCookiesFunction.bind(this);
    this.openToNewThread = this.openToNewThread.bind(this);
    this.devLogger = new _DevLogger.default();
    this.eventEmitter = eventEmitter || new _EventEmitter.default();
    this.logError = errorLogger ? errorLogger.logError : noop;
    this.scrollPercentageTracker = new _ScrollPercentageTracker.default({
      onScroll: this.handleScroll
    });
    this.exitIntentTracker = new _ExitIntentTracker.default({
      onExitIntent: this.handleExitIntent
    });
    this.iframeMessage = (0, _iframeMessagePool.iframeMessagePool)({
      iframeSrc: this.embedScriptContext.getIFrameSrc()
    });
    this.apiUsageTracker = new _ApiUsageTracker.ApiUsageTracker({
      postMessageToIframe: this.iframeMessage.post
    });
    const postMessageApiClient = new _PostMessageApiClient.PostMessageApiClient(this.iframeMessage.post);
    const pageTitleNotifications = new _PageTitleNotificationsPlugin.default();
    this.postMessageReceiver = new _PostMessageReceiver.PostMessageReceiver({
      [_pageTitleNotificationsPostMessageTypes.SHOW_PAGE_TITLE_NOTIFICATION]: pageTitleNotifications.handleShow,
      [_pageTitleNotificationsPostMessageTypes.CLEAR_PAGE_TITLE_NOTIFICATION]: pageTitleNotifications.handleClear,
      [_receivedPostMessageTypes.REQUEST_WIDGET]: this.handleRequestWidget,
      [_receivedPostMessageTypes.IFRAME_RESIZE]: this.handleResizeMessage,
      [_receivedPostMessageTypes.OPEN_CHANGE]: this.handleOpenChange,
      [_receivedPostMessageTypes.CLOSED_WELCOME_MESSAGE]: _hideWelcomeMessage.hideWelcomeMessage,
      [_receivedPostMessageTypes.STORE_MESSAGES_COOKIE]: this.handleStoreMessagesCookie,
      [_receivedPostMessageTypes.EXTERNAL_API_EVENT]: this.handleExternalApiEventMessage,
      [_receivedPostMessageTypes.API_REQUEST]: postMessageApiClient.makeApiRequest
    }, {
      allowedOrigin: this.embedScriptContext.getIFrameDomain(),
      iframeUuid: this.embedScriptContext.iframeUuid
    });
    this.exitIntentTracker.registerPostMessageReceivers(this.postMessageReceiver);
    this.scrollPercentageTracker.registerPostMessageReceivers(this.postMessageReceiver);
  }

  handleExternalApiEventMessage(message) {
    (0, _handleExternalApiEventMessage.handleExternalApiEventMessage)(message, {
      eventEmitter: this.eventEmitter
    });
  }

  handleScroll({
    scrollPercentage
  }) {
    this.iframeMessage.post(_sentPostMessageTypes.SCROLL_PERCENTAGE_CHANGE, {
      scrollPercentage
    });
  }

  handleExitIntent() {
    this.iframeMessage.post(_sentPostMessageTypes.EXIT_INTENT);
  }

  getStatus() {
    return {
      loaded: this.hasLoadedIframe,
      pending: this.isLoadingIframe
    };
  }

  handleIframeLoad() {
    this.handleWindowResize();
    this.hasLoadedIframe = true;
    this.isLoadingIframe = false;
    (0, _markEnd.markEndPostDelay)();
    this.postPerfAttributes(this.embedScriptContext.getPerfAttributes());
  }

  postPerfAttributes(perfAttributes) {
    // Only send these metrics 50% of the time to
    // stay further away from our New Relic data limit
    if (Math.random() < 0.5) {
      this.iframeMessage.post(_sentPostMessageTypes.PERF_ATTRIBUTES, {
        perfAttributes
      });
    }
  }

  resetAndReloadWidget() {
    this.removeIframe();
    (0, _resetAndLaunchWidget.resetAndLaunchWidget)();
  }

  removeIframe() {
    const iframeContainer = (0, _settingsHelpers.shouldEmbedInline)() ? document.getElementById(_elementSelectors.INLINE_PARENT_ID) : document.getElementById(_elementSelectors.PARENT_ID);

    if (iframeContainer) {
      iframeContainer.remove();
    }

    this.iframeSrc = null;
    this.hasLoadedIframe = false;
    this.isLoadingIframe = false;
  }

  handleResizeMessage({
    data: {
      height,
      width
    } = {}
  }) {
    (0, _resizeWidgetIframe.resizeWidgetIframe)({
      height,
      width,
      isOpen: this.isOpen
    });
  }

  setWidgetOpenCookie({
    isOpen
  }) {
    (0, _operators.setCookie)(_constants.cookies.IS_OPEN, isOpen, _times.default.THIRTY_MINUTES);
  }

  handleOpenChange({
    data: {
      isOpen,
      isUser
    }
  }) {
    const html = document.documentElement;
    const parent = document.getElementById(_elementSelectors.PARENT_ID);
    const shadowContainer = parent.getElementsByClassName(_widgetClassNames.SHADOW_CONTAINER)[0];
    this.isOpen = isOpen;

    if (isUser) {
      this.setWidgetOpenCookie({
        isOpen: this.isOpen
      });
    }

    if (this.isOpen) {
      html.classList.add(_widgetClassNames.ACTIVE);
      shadowContainer.classList.add('active');
    } else {
      html.classList.remove(_widgetClassNames.ACTIVE);
      shadowContainer.classList.remove('active');
    }

    if ((0, _whichDevice.isAnyMobile)() && this.isOpen) {
      const height = window.innerHeight;
      const width = window.innerWidth;
      (0, _resizeWidgetIframe.resizeWidgetIframe)({
        height,
        width,
        isOpen: this.isOpen
      });
    }
  }

  handleRequestWidget({
    source
  }) {
    (0, _sendWidgetDataToIframe.sendWidgetDataToIframe)({
      source,
      widgetData: this.widgetData,
      embedScriptContext: this.embedScriptContext,
      apiUsageTracker: this.apiUsageTracker
    });
  }

  handleStoreMessagesCookie({
    data
  }) {
    this.iframeMessage.post(_sentPostMessageTypes.FIRST_VISITOR_SESSION, {
      isFirstVisitorSession: false
    });

    if ((0, _getGlobalCookieOptOut.getGlobalCookieOptOut)() === 'yes') {
      window._hsp.push(['showBanner']);
    }

    (0, _setMessagesUtk.setMessagesUtk)(data);
  }

  requestWidgetOpen() {
    if (this.isOpen) {
      this.devLogger.log('cannot open the widget, it is already open.');
      return;
    }

    this.iframeMessage.post(_sentPostMessageTypes.REQUEST_OPEN);
  }

  requestWidgetClose() {
    if (!this.isOpen) {
      this.devLogger.log('cannot close the widget, it is already closed');
      return;
    }

    this.iframeMessage.post(_sentPostMessageTypes.REQUEST_CLOSE);
  }

  handleWindowResize() {
    const data = {
      height: window.innerHeight,
      width: window.innerWidth
    };
    this.iframeMessage.post(_sentPostMessageTypes.BROWSER_WINDOW_RESIZE, data);
  }

  requestWidgetRefresh({
    openToNewThread
  } = {}) {
    const {
      portalId
    } = this.embedScriptContext;

    if (!this.hasLoadedIframe && this.isLoadingIframe) {
      this.devLogger.log('Cannot refresh the widget - it is currently loading.');
      return;
    }

    if (this.hasLoadedIframe) {
      const requestUrl = this.embedScriptContext.getInitialRequestUrl();
      (0, _fetchWidgetData.fetchWidgetData)({
        requestUrl,
        portalId
      }, widgetData => {
        this.handleWidgetRefresh(widgetData);

        if (openToNewThread) {
          this.openToNewThread();
        }
      });
    } else {
      this.loadWidget();

      if (openToNewThread) {
        this.openToNewThread();
      }
    }
  }

  openToNewThread() {
    this.iframeMessage.post(_sentPostMessageTypes.OPEN_TO_NEW_THREAD);
  }

  extendedClearCookiesFunction(extendedFunction) {
    if (extendedFunction && extendedFunction[_extendedFunctions.RESET_WIDGET]) {
      this.removeIframe();
    }

    (0, _clearCookies.clearCookies)(extendedFunction);
  }

  handleWidgetRefresh(refreshedWidgetData) {
    this.setWidgetData(refreshedWidgetData);

    const shouldHideWidget = (0, _getWidgetDataResponseType.getWidgetDataResponseType)(this.widgetData) === _widgetResponseTypes.HIDE_WIDGET;

    if (shouldHideWidget) {
      this.removeIframe();
    } else {
      this.iframeMessage.post(_sentPostMessageTypes.REFRESH_WIDGET_DATA, Object.assign({}, this.widgetData, {}, (0, _getIframeQueryParams.getIframeQueryParams)(this.embedScriptContext)));
    }
  }

  setWidgetNotLoaded() {
    this.hasLoadedIframe = false;
    this.isLoadingIframe = false;
  }
  /*
   * Load widget data for the current page
   *
   * @param {object}   options
   * @param {boolean} [options.widgetOpen] - whether or not the widget should render
   *                                         in an open state on initial load
   */


  loadWidget(options = {}) {
    const {
      portalId
    } = this.embedScriptContext;

    if (this.isLoadingIframe) {
      this.devLogger.log('Cannot load the widget - The widget is already being loaded.');
      this.logError('load widget called while public widget request is pending');
      return;
    }

    if (this.hasLoadedIframe) {
      this.devLogger.log('Cannot load the widget - the widget has already loaded.');
      return;
    }

    this.isLoadingIframe = true;

    if (options.widgetOpen) {
      this.setWidgetOpenCookie({
        isOpen: true
      });
    }

    (0, _fetchWidgetData.fetchWidgetData)({
      requestUrl: this.embedScriptContext.getInitialRequestUrl(),
      portalId
    }, (0, _handleTargetingAndDelay.handleTargetingAndDelay)(this.setWidgetData, this.loadIFrame, this.setWidgetNotLoaded), () => {
      _events.EVENTS.messagesInitialized({
        messageWillRender: false
      });
    });
  }

  start() {
    const {
      shouldRender
    } = (0, _shouldRenderWidget.shouldRenderWidget)(this.embedScriptContext);

    if (!shouldRender) {
      try {
        // Prototype can cause this to fail
        _events.EVENTS.messagesInitialized({
          messageWillRender: false
        });
      } catch (e) {
        this.devLogger.log(`widget load aborted`);
      }

      return;
    }

    (0, _setupExternalApi.setupExternalApi)({
      debug: this.devLogger.debug,
      on: (eventName, listener) => {
        this.eventEmitter.on(eventName, listener);
        this.apiUsageTracker.trackEventListener(eventName);
      },
      off: this.eventEmitter.off,
      clear: (...args) => {
        this.extendedClearCookiesFunction(...args);
        this.apiUsageTracker.trackMethod('clear');
      },
      resetAndReloadWidget: this.resetAndReloadWidget,
      widget: {
        load: (...args) => {
          this.loadWidget(...args);
          this.apiUsageTracker.trackMethod('load');
        },
        remove: () => {
          this.removeIframe();
          this.apiUsageTracker.trackMethod('remove');
        },
        open: () => {
          this.requestWidgetOpen();
          this.apiUsageTracker.trackMethod('open');
        },
        close: () => {
          this.requestWidgetClose();
          this.apiUsageTracker.trackMethod('close');
        },
        refresh: (...args) => {
          this.requestWidgetRefresh(...args);
          this.apiUsageTracker.trackMethod('refresh');
        },
        status: () => {
          this.apiUsageTracker.trackMethod('status');
          return this.getStatus();
        }
      }
    }, this.embedScriptContext);
    (0, _flushOnReadyCallbacks.flushOnReadyCallbacks)({
      logger: this.devLogger,
      trackCallback: this.apiUsageTracker.trackOnReady
    });
    (0, _registerHashChangeListener.registerHashChangeListener)({
      requestWidgetOpen: this.requestWidgetOpen,
      isOpen: this.isOpen
    });
    (0, _registerWindowResizeListener.registerWindowResizeListener)({
      resizeCallbackFn: this.handleWindowResize
    });
    (0, _registerCookieListeners.registerCookieListeners)({
      postMessageToIframe: this.iframeMessage.post
    });

    if ((0, _settingsHelpers.shouldLoadImmediately)()) {
      this.loadWidget();
    }
  }

  setFrameClass() {
    const parent = document.getElementById(_elementSelectors.PARENT_ID);
    if (!parent) return;
    const widgetLocation = this.widgetData[_widgetDataKeys.WIDGET_LOCATION];
    (0, _setClassInClassList.setClassInClassList)({
      widgetLocation,
      classList: parent.classList
    });
  }

}

exports.WidgetShell = WidgetShell;