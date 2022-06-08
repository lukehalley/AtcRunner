"use strict";
'use es6';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startOnceReady = startOnceReady;

var _WidgetShell = require("./WidgetShell");

var _safeLog = require("./utils/safeLog");

var _loadWidgetCss = require("./utils/loadWidgetCss");

var _createEmbedScriptContext = require("./embed-script-context/createEmbedScriptContext");

var _hasRequiredFeatures = require("./utils/hasRequiredFeatures");

var _setupExternalApi = require("./external-api/setupExternalApi");

var _getExternalApiSettings = require("./external-api/getExternalApiSettings");

var _constants = require("./external-api/constants");

var _EventEmitter = _interopRequireDefault(require("./event-emitter/EventEmitter"));

var _flushOnReadyCallbacks = require("./external-api/flushOnReadyCallbacks");

var _DevLogger = _interopRequireDefault(require("./external-api/DevLogger"));

var _ErrorLogger = require("./error-logging/ErrorLogger");

var _envGetters = require("./embed-script-context/envGetters");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-console */
const widgetNotYetLoadedWarning = () => {
  console.warn(`loadImmediately is set to false and widget.load() has not been called on window.${_constants.GLOBAL_VARIABLE} yet. Please call widget.load() first or set loadImmediately on window.${_constants.SETTINGS_VARIABLE} to true.`);
};
/* eslint-enable no-console */


const noop = () => {};

function createWidgetShell({
  eventEmitter,
  logError = noop
}) {
  const embedScriptContext = (0, _createEmbedScriptContext.createEmbedScriptContext)();
  const widgetShell = new _WidgetShell.WidgetShell(embedScriptContext, eventEmitter, logError);

  if (!window.hubspot_live_messages_running) {
    window.hubspot_live_messages_running = true;
    widgetShell.start();
  } else {
    (0, _safeLog.warn)('duplicate instance of live chat exists on page');
  }

  return widgetShell;
}

function init(logError) {
  (0, _loadWidgetCss.loadWidgetCss)(document);

  if (!(0, _getExternalApiSettings.getExternalApiSettings)().loadImmediately) {
    const eventEmitter = new _EventEmitter.default();
    const devLogger = new _DevLogger.default();
    (0, _setupExternalApi.setupExternalApi)({
      debug: widgetNotYetLoadedWarning,
      on: eventEmitter.on,
      off: eventEmitter.off,
      clear: widgetNotYetLoadedWarning,
      resetAndReloadWidget: widgetNotYetLoadedWarning,
      widget: {
        load: () => {
          const widgetShell = createWidgetShell({
            eventEmitter,
            logError
          });
          widgetShell.loadWidget();
        },
        remove: widgetNotYetLoadedWarning,
        open: widgetNotYetLoadedWarning,
        close: widgetNotYetLoadedWarning,
        refresh: widgetNotYetLoadedWarning,
        status: () => ({
          loaded: false
        })
      }
    });
    (0, _flushOnReadyCallbacks.flushOnReadyCallbacks)({
      logger: devLogger
    });
  } else {
    createWidgetShell({
      logError
    });
  }
}

function startOnceReady() {
  /**
   * Before we do anything else, make sure we're operating in a supported browser
   */
  if ((0, _hasRequiredFeatures.hasRequiredFeatures)(window)) {
    const errorLogger = new _ErrorLogger.ErrorLogger();

    if (!(0, _envGetters.getIsLocal)()) {
      errorLogger.captureErrors(() => {
        init(errorLogger);
      });
    } else {
      init();
    }
  }
}