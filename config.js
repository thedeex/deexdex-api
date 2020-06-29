"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getConfig = exports.setConfig = exports.addConfig = void 0;
const defaultConfig = {
  name: "Deex",
  coreAsset: "DEEX",
  addressPrefix: "DX",
  expireInSecs: 15,
  expireInSecsProposal: 24 * 60 * 60,
  reviewInSecsCommittee: 24 * 60 * 60,
  chainId: "c6930e4040926369e4851f811a4fce873d921b14649596297813a4f5f1131dfd"
};
let networks = [defaultConfig],
    current = null;

const addConfig = config => networks.push({ ...defaultConfig,
  ...config
});

exports.addConfig = addConfig;

const setConfig = chainId => current = networks.find(net => net.chainId === chainId);

exports.setConfig = setConfig;

const getConfig = () => current;

exports.getConfig = getConfig;