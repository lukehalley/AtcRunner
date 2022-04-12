"use strict";

var _sdk = require("@synapseprotocol/sdk");

var _providers = require("@ethersproject/providers");

var _units = require("@ethersproject/units");

// Initialize dummy Ethers Provider
var AVAX_PROVIDER = new _providers.JsonRpcProvider("https://api.avax.network/ext/bc/C/rpc"); // Use SDK Data about different chains

var AVAX_NETWORK = _sdk.Networks.AVALANCHE; // Initialize Bridge

var SYNAPSE_BRIDGE = new _sdk.Bridge.SynapseBridge({
  network: AVAX_NETWORK,
  provider: AVAX_PROVIDER
}); // Set up some variables to prepare a Avalanche USDC -> BSC USDT quote

var TOKEN_IN = _sdk.Tokens.USDC,
    TOKEN_OUT = _sdk.Tokens.USDT,
    CHAIN_OUT = _sdk.ChainId.BSC,
    INPUT_AMOUNT = (0, _units.parseUnits)("1000", TOKEN_IN.decimals(AVAX_NETWORK.chainId));
SYNAPSE_BRIDGE.estimateBridgeTokenOutput({
  tokenFrom: TOKEN_IN,
  // token to send from the source chain, in this case USDT on Avalanche
  chainIdTo: CHAIN_OUT,
  // Chain ID of the destination chain, in this case BSC
  tokenTo: TOKEN_OUT,
  // Token to be received on the destination chain, in this case USDC
  amountFrom: INPUT_AMOUNT
}).then(function (_ref) {
  var amountToReceive = _ref.amountToReceive,
      bridgeFee = _ref.bridgeFee;
  var amountOutFormatted = (0, _units.formatUnits)(amountToReceive, TOKEN_OUT.decimals(CHAIN_OUT));
  console.log("".concat(amountOutFormatted, " USDT will be received on the output chain"));
})["catch"](function (err) {
  return console.error(err);
});