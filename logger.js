"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.debug = exports.error = exports.warn = exports.info = exports.setLogger = void 0;
var logger = {
  info: null,
  warn: null,
  error: console.error,
  debug: null
};

const setLogger = (obj = logger) => {
  let {
    info,
    warn,
    error,
    debug
  } = obj;
  logger = {
    info,
    warn,
    error,
    debug
  };
};

exports.setLogger = setLogger;

const info = (...args) => logger.info && logger.info(...args);

exports.info = info;

const warn = (...args) => logger.warn && logger.warn(...args);

exports.warn = warn;

const error = (...args) => logger.error && logger.error(...args);

exports.error = error;

const debug = (...args) => logger.debug && logger.debug(...args);

exports.debug = debug;