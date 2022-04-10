"use strict";
exports.__esModule = true;
var sdk_1 = require("@synapseprotocol/sdk");
var bignumber_1 = require("@ethersproject/bignumber");
// Check a normal `number` argument against a known Chain ID.
function example(chainId) {
    if (chainId === sdk_1.ChainId.BSC) {
        console.log("".concat(chainId, " is the Chain ID of the Binance Smart Chain!"));
    }
}
// Check a BigNumberish (which could be a whole host of types)
// against a known Chain ID.
function example2(chainId) {
    var paramAsNum = bignumber_1.BigNumber.from(chainId).toNumber();
    if (paramAsNum === sdk_1.ChainId.FANTOM) {
        console.log("".concat(paramAsNum, " is the Chain ID of the Fantom network!"));
    }
}
