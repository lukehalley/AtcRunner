// @ts-ignore
import {
    Bridge,
    Tokens,
    ChainId,
    Networks,
    NetworkSwappableTokensMap
} from "@synapseprotocol/sdk";

import {JsonRpcProvider} from "@ethersproject/providers";
import {ContractTransaction, PopulatedTransaction} from "@ethersproject/contracts";
import {parseUnits, formatUnits} from "@ethersproject/units";
import {BigNumber} from "@ethersproject/bignumber";

// Initialize dummy Ethers Provider
const AVAX_PROVIDER = new JsonRpcProvider("https://api.avax.network/ext/bc/C/rpc");
// Use SDK Data about different chains
const AVAX_NETWORK = Networks.AVALANCHE;

// Initialize Bridge
const SYNAPSE_BRIDGE = new Bridge.SynapseBridge({
    network:  AVAX_NETWORK,
    provider: AVAX_PROVIDER
});

// Set up some variables to prepare a Avalanche USDC -> BSC USDT quote
const
    TOKEN_IN   = Tokens.USDC,
    TOKEN_OUT  = Tokens.USDT,
    CHAIN_OUT  = ChainId.BSC,
    INPUT_AMOUNT: BigNumber = parseUnits("1000", TOKEN_IN.decimals(AVAX_NETWORK.chainId));


SYNAPSE_BRIDGE.estimateBridgeTokenOutput({
    tokenFrom:  TOKEN_IN,      // token to send from the source chain, in this case USDT on Avalanche
    chainIdTo:  CHAIN_OUT,     // Chain ID of the destination chain, in this case BSC
    tokenTo:    TOKEN_OUT,     // Token to be received on the destination chain, in this case USDC
    amountFrom: INPUT_AMOUNT,
}).then(({ amountToReceive, bridgeFee }) => {
    let amountOutFormatted = formatUnits(
        amountToReceive,
        TOKEN_OUT.decimals(CHAIN_OUT)
    );
    console.log(`${amountOutFormatted} USDT will be received on the output chain`)
})
    .catch((err) => console.error(err.toString()));