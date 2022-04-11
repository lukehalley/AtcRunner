"use strict";
exports.__esModule = true;
// @ts-ignore
var sdk_1 = require("@synapseprotocol/sdk");
var providers_1 = require("@ethersproject/providers");
var units_1 = require("@ethersproject/units");
// Initialize dummy Ethers Provider
var AVAX_PROVIDER = new providers_1.JsonRpcProvider("https://api.avax.network/ext/bc/C/rpc");
// Use SDK Data about different chains
var AVAX_NETWORK = sdk_1.Networks.AVALANCHE;
// Initialize Bridge
var SYNAPSE_BRIDGE = new sdk_1.Bridge.SynapseBridge({
    network: AVAX_NETWORK,
    provider: AVAX_PROVIDER
});
// Set up some variables to prepare a Avalanche USDC -> BSC USDT quote
var TOKEN_IN = sdk_1.Tokens.USDC, TOKEN_OUT = sdk_1.Tokens.USDT, CHAIN_OUT = sdk_1.ChainId.BSC, INPUT_AMOUNT = (0, units_1.parseUnits)("1000", TOKEN_IN.decimals(AVAX_NETWORK.chainId));
SYNAPSE_BRIDGE.estimateBridgeTokenOutput({
    tokenFrom: TOKEN_IN,
    chainIdTo: CHAIN_OUT,
    tokenTo: TOKEN_OUT,
    amountFrom: INPUT_AMOUNT
}).then(function (_a) {
    var amountToReceive = _a.amountToReceive, bridgeFee = _a.bridgeFee;
    var amountOutFormatted = (0, units_1.formatUnits)(amountToReceive, TOKEN_OUT.decimals(CHAIN_OUT));
    console.log("".concat(amountOutFormatted, " USDT will be received on the output chain"));
})["catch"](function (err) { return console.error(err.toString()); });
