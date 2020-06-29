const defaultConfig = {
  name: "Deex",
  coreAsset: "DEEX",
  addressPrefix: "DX",
  expireInSecs: 15,
  expireInSecsProposal: 24 * 60 * 60,
  reviewInSecsCommittee: 24 * 60 * 60,
  chainId: "c6930e4040926369e4851f811a4fce873d921b14649596297813a4f5f1131dfd"
};

let networks = [
    defaultConfig,

  ],
  current = null;

export const addConfig = config =>
  networks.push({ ...defaultConfig, ...config });

export const setConfig = chainId =>
  (current = networks.find(net => net.chainId === chainId));

export const getConfig = () => current;
