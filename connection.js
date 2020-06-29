"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetch = exports.disconnect = exports.connect = exports.setNotifyStatusCallback = exports.getStatus = void 0;

var _logger = require("./logger");

var _config = require("./config");

var _apis = require("./apis");

var _servers = require("./servers");

const WebSocket = require("isomorphic-ws");

var ws,
    sent = {
  length: 0
},
    conn = {
  promise: null,
  resolve: null,
  reject: null,
  result: false
},
    disconn = {
  promise: Promise.resolve(),
  resolve: null,
  reject: null,
  result: true
},
    notifyCallback = () => false,
    responseTimeout = 5000,
    reconnectTimeout = false;

const getStatus = () => {
  if (!ws) return "closed";
  return ["connecting", "open", "closing", "closed"][ws.readyState];
};

exports.getStatus = getStatus;

const setNotifyStatusCallback = callback => notifyCallback = callback;

exports.setNotifyStatusCallback = setNotifyStatusCallback;

const connect = (servers = (0, _servers.getServers)(), timeout = responseTimeout, reconnect = reconnectTimeout) => {
  (0, _servers.setServers)(servers);
  reconnectTimeout = reconnect;
  responseTimeout = timeout;
  return conn.promise = ws && (conn.result === null || conn.result === true && (reconnectTimeout || getStatus() === "open")) ? conn.promise : new Promise((resolve, reject) => {
    (0, _logger.debug)("call connect");

    const clearAfter = (method, result) => (...args) => {
      method(...args);
      conn.result = result;
    };

    conn.result = null;
    conn.resolve = clearAfter(resolve, true);
    conn.reject = clearAfter(reject, false);

    try {
      connectSocket();
    } catch (err) {
      (0, _logger.error)(err);
      reject(err);
      ws = null;
    }
  });
};

exports.connect = connect;

const connectSocket = () => {
  let server = (0, _servers.nextServer)();
  ws = new WebSocket(server);
  ws.onopen = onOpen;
  ws.onclose = onClose;
  ws.onmessage = onMessage;
  ws.onerror = onError;
};

const disconnect = () => disconn.promise = disconn.result === null || disconn.result === true && getStatus() !== "close" ? disconn.promise : new Promise((resolve, reject) => {
  (0, _logger.debug)("call disconnect");
  reconnectTimeout = null;

  if (ws) {
    const clearAfter = (method, result) => (...args) => {
      method(...args);
      disconn.result = result;
    };

    disconn.result = null;
    disconn.resolve = clearAfter(resolve, true);
    disconn.reject = clearAfter(reject, false);
    ws.close();
  } else resolve();
});

exports.disconnect = disconnect;

const onOpen = async () => {
  (0, _logger.debug)("onOpen");
  notifyCallback(getStatus());

  try {
    if (!(await fetch("call", [1, "login", ["", ""]]).catch(() => false))) throw new Error("Login error");
    await Promise.all(Object.entries(_apis.APIs).map(([key, {
      name
    }]) => fetch("call", [1, name, []]).then(id => (0, _apis.setAPIId)(key, id)).catch(() => (0, _logger.warn)(`${name} API error`))));
    let chainId = await fetch("call", [_apis.APIs.database.id, "get_chain_id", []]);
    if (!(0, _config.setConfig)(chainId)) throw new Error(`Unknown chain id (this may be a testnet): ${chainId}`);
    (0, _logger.info)(`Connected to ${(0, _servers.currServer)()}`);
    conn.resolve((0, _config.getConfig)());
  } catch (err) {
    (0, _logger.error)(err);
    ws.close();
  }
};

const onClose = () => {
  (0, _logger.debug)("onClose", reconnectTimeout);
  sent = {
    length: 0
  };
  if (!notifyCallback(getStatus()) && reconnectTimeout) setTimeout(connectSocket, reconnectTimeout);else {
    conn.result === null && conn.reject();
    disconn.result === null && disconn.resolve();
  }
};

const onMessage = ({
  data
}) => {
  try {
    let {
      id,
      method,
      params,
      result,
      error
    } = JSON.parse(data);
    if (method === "notice" && sent[params[0]].notice) sent[params[0]].notice(params[1]);

    if (id !== undefined && sent[id]) {
      error ? sent[id].reject(error) : sent[id].resolve(result);
      if (!sent[id].notice) delete sent[id];
    }
  } catch (err) {
    (0, _logger.error)(err);
  }
};

const onError = err => {
  notifyCallback(getStatus());
  (0, _logger.error)("error");
  conn.result === null && conn.reject(err);
  disconn.result === null && disconn.reject(err);
};

const fetch = (method, params) => new Promise((resolve, reject) => {
  let timeout = setTimeout(() => reject("timeout"), responseTimeout);
  let callbacks = {
    resolve: response => {
      clearTimeout(timeout);
      resolve(response);
    },
    reject
  };

  if (_apis.METHODS_WITH_CALLBACK.includes(params[1])) {
    callbacks.notice = params[2][0];
    params[2][0] = sent.length;
  }

  ws.send(JSON.stringify({
    id: sent.length,
    jsonrpc: "2.0",
    method,
    params
  }));
  sent[sent.length++] = callbacks;
});

exports.fetch = fetch;