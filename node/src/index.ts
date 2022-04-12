import {
    Bridge,
    Token,
    Tokens,
    ChainId,
    Networks,
    networkSwapTokensMap,
    NetworkSwappableTokensMap
} from "@synapseprotocol/sdk";

import {BigNumber} from "@ethersproject/bignumber";

import {
    parseUnits,
    formatUnits
} from "@ethersproject/units";

import {Signer} from "@ethersproject/abstract-signer";

import {
    Provider,
    JsonRpcProvider
} from "@ethersproject/providers";

import {
    ContractTransaction,
    PopulatedTransaction
} from "@ethersproject/contracts";

// Use your normal web3 provider here, such as one provided by "@web3-react". 
// The PROVIDER constant here is for the purposes of this example only. 
const PROVIDER: Provider = new JsonRpcProvider("https://api.avax.network/ext/bc/C/rpc");

const
    SOURCE_NETWORK  = Networks.AVALANCHE,
    SOURCE_CHAIN_ID = SOURCE_NETWORK.chainId; // alternatively, use ChainId.AVALANCHE

const SYNAPSE_BRIDGE = new Bridge.SynapseBridge({
    network:  NETWORK,
    provider: PROVIDER
});

const
    TOKEN_IN:  Token  = Tokens.NUSD,
    TOKEN_OUT: Token  = Tokens.USDT,
    CHAIN_OUT: number = ChainId.BSC,
    INPUT_AMOUNT_ETHER: string    = "1000",
    INPUT_AMOUNT_WEI:   BigNumber = TOKEN_IN.valueToWei(INPUT_AMOUNT_ETHER, SOURCE_CHAIN_ID);
// the Token type provides the `valueToWei()` function, which takes a value in Ether and returns the
// that amount represented in Wei units based on that Token's decimals field for the passed Chain ID.
// Never again shall you need to remember on which chains USDC uses 6 decimals and on which it uses 18!


function listSupportedSwaps() {
    // Get an object containing supported output tokens from one chain to all others
    let fromAvaxSupportedOutputs: NetworkSwappableTokensMap = networkSwapTokensMap(ChainId.AVALANCHE);
    /*
    Output structure: { chain id: [ array of Token objects ] }
    
    Output:
    {
        '1': [
            {
              name: 'Dai',
              symbol: 'DAI',
            },
            {
              name: 'USD Circle',
              symbol: 'USDC',
            },
            {
              name: 'USD Tether',
              symbol: 'USDT',
            },
            {
              name: 'Synapse nUSD',
              symbol: 'nUSD',
            },
            {
              name: 'Synapse',
              symbol: 'SYN',
            }
        ],
        '10': [
            {
              name: 'Synapse',
              symbol: 'SYN',
            }
        ],
        '56': [
            {
              name: 'Binance USD',
              symbol: 'BUSD',
            },
            {
              name: 'USD Circle',
              symbol: 'USDC',
            },
            {
              name: 'USD Tether',
              symbol: 'USDT',
            },
            {
              name: 'Synapse nUSD',
              symbol: 'nUSD',
            },
            {
              name: 'Synapse',
              symbol: 'SYN',
            },
            {
              name: 'Feisty Doge',
              symbol: 'NFD',
            }
        ],
        '137': [
            {
              name: 'Dai',
              symbol: 'DAI',
            },
            ...
        ],
        ...
    }
     */


    let fromAvaxToBSCSupportedOutputs: NetworkSwappableTokensMap = networkSwapTokensMap(ChainId.AVALANCHE, ChainId.BSC);
    /*
    Output (same structure as above):
    {
        '56': [
            {
              name: 'Binance USD',
              symbol: 'BUSD',
            },
            {
              name: 'USD Circle',
              symbol: 'USDC',
            },
            {
              name: 'USD Tether',
              symbol: 'USDT',
            },
            {
              name: 'Synapse nUSD',
              symbol: 'nUSD',
            },
            {
              name: 'Synapse',
              symbol: 'SYN',
            },
            {
              name: 'Feisty Doge',
              symbol: 'NFD',
            }
        ]
    }
     */
}

function checkSwapSupported() {
    let {swapSupported, reasonNotSupported} = Bridge.bridgeSwapSupported({
        chainIdFrom: SOURCE_CHAIN_ID, // Chain ID of the source chain, in this case Avalanche
        chainIdTo:   CHAIN_OUT,       // Chain ID of the destination chain, in this case BSC
        tokenFrom:   TOKEN_IN,        // token to send from the source chain, in this case nUSD on Avalanche
        tokenTo:     TOKEN_OUT,       // Token to be received on the destination chain, in this case USDC
    });

    // swapSupported will be `true` if the swap/bridge between tokens on networks is possible,
    // along with an empty string.
    // If a swap/bridge ISN'T supported, swapSupported will be `false`, and `reasonNotSupported`
    // will provide a short reason for why the swap/bridge isn't possible.
}

// get the estimated output for a bridge from nUSD on Avalanche
// to USDT on Binance Smart Chain.
function estimateBridgeTokenOutput() {
    SYNAPSE_BRIDGE.estimateBridgeTokenOutput({
        tokenFrom:  TOKEN_IN,      // token to send from the source chain, in this case nUSD on Avalanche
        chainIdTo:  CHAIN_OUT,     // Chain ID of the destination chain, in this case BSC
        tokenTo:    TOKEN_OUT,     // Token to be received on the destination chain, in this case USDC
        amountFrom: INPUT_AMOUNT_WEI,
    })
        .then(({ amountToReceive, bridgeFee }) => {
            let amountOutFormatted = formatUnits(
                amountToReceive,
                TOKEN_OUT.decimals(chainOut)
            );
            console.log(`${amountOutFormatted} USDT will be received on the output chain`);

            // You can also use this promise to return the result of estimateBridgeTokenOutput.
        })
        .catch((err) => throw new Error(err.toString()))
}

/**
 * Use the following flow if manually constructing and sending transactions is desired.
 *
 * Note that in this flow, both of the constructed transactions must be sent/executed manually on behalf of the user;
 * how this execution occurs is up to the developer/team and their desired implementation.
 *
 * If your project maintains some sort of storage for contract approvals such that it's able to determine that an approval
 * transaction isn't necessary in a given context, then there's obviously no need to build or send an otherwise unnecessary
 * approval transaction.
 */
async function doBridgeTransaction_manual() {
    // get minimum desired output
    const { amountToReceive } = await SYNAPSE_BRIDGE.estimateBridgeTokenOutput({
        tokenFrom:  TOKEN_IN,          // token to send from the source chain, in this case nUSD on Avalanche
        chainIdTo:  CHAIN_OUT,         // Chain ID of the destination chain, in this case BSC
        tokenTo:    TOKEN_OUT,         // Token to be received on the destination chain, in this case USDC
        amountFrom: INPUT_AMOUNT_WEI,  // Amount of `tokenFrom` being sent (in Wei)
    });

    let
        populatedApproveTxn:     PopulatedTransaction,
        populatedBridgeTokenTxn: PopulatedTransaction;

    // build an ERC20 Approve transaction to have the user send so that the Synapse Bridge contract
    // can do its thing.
    // If desired, `amount` can be passed in the args object, which overrides
    // the default behavior of "infinite approval" for the token.
    try {
        populatedApproveTxn = await SYNAPSE_BRIDGE.buildApproveTransaction({token: TOKEN_IN});
    } catch (e) {
        // handle error if one occurs
    }

    // insert whatever method(s) used by your project for sending the populated ERC20 Approve transaction

    // Now, build the actual Bridge transaction to send via web3 (or ethers, or whatever).
    try {
        populatedBridgeTokenTxn = await SYNAPSE_BRIDGE.buildBridgeTokenTransaction({
            tokenFrom:  TOKEN_IN,         // token to send from the source chain, in this case nUSD on Avalanche
            chainIdTo:  CHAIN_OUT,        // Chain ID of the destination chain, in this case BSC
            tokenTo:    TOKEN_OUT,        // Token to be received on the destination chain, in this case USDC
            amountFrom: INPUT_AMOUNT_WEI, // Amount of `tokenFrom` being sent (in Wei)
            amountTo:   amountToReceive,  // minimum desired amount of `tokenTo` (in Wei) to receive on the destination chain
        });
    } catch (e) {
        // handle error if one occurs
    }

    // insert whatever method(s) used by your project for sending the populated Bridge transaction

    // !!! You're done!
}

/**
 * Use the following flow if having the SDK take care of Approval and Bridge "magically" is desired.
 *
 * Note that in this flow, a valid ethersjs Signer instance must be passed to executeApproveTransaction
 * and executeBridgeTokenTransaction so that they're able to send/execute their respective transactions on behalf
 * of the user.
 *
 * When using @web3-react or other popular frontend web3/metamask libraries, ethers-compatible Web3Provider instances
 * are usually retrievable; these instances have a `getSigner()` function which returns an ethers Signer instance, which
 * can then be used wherever needed.
 *
 * If your project maintains some sort of storage for contract approvals such that it's able to determine that an approval
 * transaction isn't necessary in a given context, then there's obviously no need to send an otherwise unnecessary
 * approval transaction.
 */
async function doBridgeTransaction_magic() {
    // Obviously this should not be null in practice, but it is such here for the purposes of example documentation.
    let signer: Signer = null; // when using a Provider from the ethers.js package, this can be [provider variable].getSigner()

    // get minimum desired output
    const { amountToReceive } = await SYNAPSE_BRIDGE.estimateBridgeTokenOutput({
        tokenFrom:  TOKEN_IN,          // token to send from the source chain, in this case nUSD on Avalanche
        chainIdTo:  CHAIN_OUT,         // Chain ID of the destination chain, in this case BSC
        tokenTo:    TOKEN_OUT,         // Token to be received on the destination chain, in this case USDC
        amountFrom: INPUT_AMOUNT_WEI,  // Amount of `tokenFrom` being sent (in Wei)
    });

    try {
        // build and execute an ERC20 Approve transaction so that the Synapse Bridge contract
        // can do its thing.
        // If desired, `amount` can be passed in the args object, which overrides
        // the default behavior of "infinite approval" for the token.
        let approveTxn: ContractTransaction = await SYNAPSE_BRIDGE.executeApproveTransaction({
            token: TOKEN_IN
        }, signer);

        // Wait for at least one confirmation on the sending chain, this is an optional
        // step and can be either omitted or implemented in a custom manner.
        await approveTxn.wait(1);

        console.log(`ERC20 Approve transaction hash: ${approveTxn.hash}`);
        console.log(`ERC20 Approve transaction block number: ${approveTxn.blockNumber}`);
    } catch (err) {
        // deal with the caught error accordingly
    }

    try {
        // executeBridgeTokenTransaction requires an ethers Signer instance to be 
        // passed to it in order to actually do the bridge transaction.
        // An optional field `addressTo` can be passed, which will send tokens
        // on the output chain to an address other than the address of the Signer instance.
        //
        // NOTE: executeBridgeTokenTransaction performs the step of actually sending/broadcasting the signed
        // transaction on the source chain.
        let bridgeTxn: ContractTransaction = await SYNAPSE_BRIDGE.executeBridgeTokenTransaction({
            tokenFrom:  TOKEN_IN,          // token to send from the source chain, in this case nUSD on Avalanche
            chainIdTo:  CHAIN_OUT,         // Chain ID of the destination chain, in this case BSC
            tokenTo:    TOKEN_OUT,         // Token to be received on the destination chain, in this case USDC
            amountFrom: INPUT_AMOUNT_WEI,  // Amount of `tokenFrom` being sent (in Wei)
            amountTo:   amountToReceive,   // minimum desired amount of `tokenTo` (in Wei) to receive on the destination chain
        }, signer);

        // Wait for at least one confirmation on the sending chain, this is an optional
        // step and can be either omitted or implemented in a custom manner.
        await bridgeTxn.wait(1);

        console.log(`Bridge transaction hash: ${bridgeTxn.hash}`);
        console.log(`Bridge transaction block number: ${bridgeTxn.blockNumber}`);
    } catch (err) {
        // deal with the caught error accordingly
    }

    // !!! You're done! That was easy
}