"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "setLogger", {
  enumerable: true,
  get: function () {
    return _logger.setLogger;
  }
});
Object.defineProperty(exports, "addConfig", {
  enumerable: true,
  get: function () {
    return _config.addConfig;
  }
});
Object.defineProperty(exports, "getConfig", {
  enumerable: true,
  get: function () {
    return _config.getConfig;
  }
});
Object.defineProperty(exports, "connect", {
  enumerable: true,
  get: function () {
    return _connection.connect;
  }
});
Object.defineProperty(exports, "disconnect", {
  enumerable: true,
  get: function () {
    return _connection.disconnect;
  }
});
Object.defineProperty(exports, "getStatus", {
  enumerable: true,
  get: function () {
    return _connection.getStatus;
  }
});
Object.defineProperty(exports, "setNotifyStatusCallback", {
  enumerable: true,
  get: function () {
    return _connection.setNotifyStatusCallback;
  }
});
exports.call = exports.orders = exports.asset = exports.block = exports.network = exports.crypto = exports.history = exports.database = void 0;

var _logger = require("./logger");

var _config = require("./config");

var _apis = require("./apis");

var _connection = require("./connection");

const getAPI = name => new Proxy(_apis.APIs, {
  get: (_, method) => {
    if (typeof method === "symbol") return _;
    return (...args) => {
      method = method.replace(/([A-Z])/g, $1 => `_${$1.toLowerCase()}`);
      (0, _logger.debug)(`call ${name}.${method}(${args.map(arg => JSON.stringify(arg))})`);
      let id = name === "call" ? (0, _apis.getIdByMethod)(method) : _apis.APIs[name].id;
      if (id === undefined) (0, _logger.warn)(`${name} does not have access to ${method}`);
      return (0, _connection.fetch)("call", [id, method, args]);
    };
  }
});

const database = getAPI("database");
exports.database = database;
const history = getAPI("history");
exports.history = history;
const crypto = getAPI("crypto");
exports.crypto = crypto;
const network = getAPI("network");
exports.network = network;
const block = getAPI("block");
exports.block = block;
const asset = getAPI("asset");
exports.asset = asset;
const orders = getAPI("orders");
exports.orders = orders;
const call = getAPI("call");
exports.call = call;