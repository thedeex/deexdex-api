"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.nextServer = exports.currServer = exports.getServers = exports.setServers = void 0;
let addresses = [],
    curIndex = Infinity;

const setServers = servers => {
  addresses = servers instanceof Array ? servers.filter(s => s) : [servers];
};

exports.setServers = setServers;

const getServers = () => addresses;

exports.getServers = getServers;

const currServer = () => addresses[curIndex];

exports.currServer = currServer;

const nextServer = () => {
  curIndex++;
  if (curIndex >= addresses.length) curIndex = 0;
  return addresses[curIndex];
};

exports.nextServer = nextServer;