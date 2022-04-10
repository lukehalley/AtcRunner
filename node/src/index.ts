import { ChainId } from "@synapseprotocol/sdk";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";

// Check a normal `number` argument against a known Chain ID.
function example(chainId: number) {
    if (chainId === ChainId.BSC) {
        console.log(`${chainId} is the Chain ID of the Binance Smart Chain!`);
    }
}

// Check a BigNumberish (which could be a whole host of types)
// against a known Chain ID.
function example2(chainId: BigNumberish) {
    let paramAsNum = BigNumber.from(chainId).toNumber();

    if (paramAsNum === ChainId.FANTOM) {
        console.log(`${paramAsNum} is the Chain ID of the Fantom network!`);
    }
}