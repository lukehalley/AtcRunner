import logging, os, sys
from web3 import Web3

from src.wallet.queries.network import getPrivateKey, getWalletGasBalance
from src.utils.chain import getTokenDecimalValue
from src.wallet.actions.swap import swapToken

# Set up our logging
logger = logging.getLogger("DFK-DEX")

# Send a raw transaction
def sendRawTransaction(rpcURL, transaction):

    w3 = Web3(Web3.HTTPProvider(rpcURL))

    privateKey = getPrivateKey()

    try:
        signedTransaction = w3.eth.account.sign_transaction(transaction, private_key=privateKey)
        sentTransaction = w3.eth.sendRawTransaction(signedTransaction.rawTransaction)
        return sentTransaction.hex()
    except ValueError as transactionError:
        logger.error(f"An error occured when sending raw transaction: {transactionError}")
        raise

def topUpWalletGas(recipe, direction, toSwapFrom):

    minimumGasBalance = float(os.environ.get("MIN_GAS_BALANCE"))
    maximumGasBalance = float(os.environ.get("MAX_GAS_BALANCE"))

    fromAddress = recipe[direction][toSwapFrom]["address"]
    toAddress = recipe[direction]["gas"]["address"]

    gasBalance = recipe[direction]["wallet"]["balances"]["gas"]

    fromPrice = recipe[direction][toSwapFrom]["price"]
    gasPrice = recipe[direction]["gas"]["price"]

    fromBalanceValue = recipe[direction]["wallet"]["balances"][toSwapFrom] * fromPrice

    needsGas = gasBalance < minimumGasBalance

    if needsGas:
        gasTokensNeeded = maximumGasBalance - gasBalance
        topUpCost = gasTokensNeeded * gasPrice

        amountIn = topUpCost / fromPrice

        if topUpCost > fromBalanceValue:
            errMsg = f'Error topping up {direction} ({recipe[direction]["chain"]["name"]}) wallet with gas: Not enough stables (balance: {fromBalanceValue}) to purchase {gasTokensNeeded} {recipe[direction]["gas"]["symbol"]} for {topUpCost} {recipe[direction]["stablecoin"]["symbol"]}'
            logger.error(errMsg)
            sys.exit(errMsg)

        logger.info(f'{direction} wallet ({recipe[direction]["chain"]["name"]}) needs gas - adding {gasTokensNeeded} {recipe[direction]["gas"]["symbol"]} for {topUpCost} {recipe[direction]["stablecoin"]["symbol"]}')

        try:

            amountInWei = int(getTokenDecimalValue(amountIn, recipe[direction][toSwapFrom]["decimals"]))
            amountOutWei = int(getTokenDecimalValue(gasTokensNeeded, 18))

            swapToken(
                tokenToSwapFrom=fromAddress,
                tokenToSwapTo=toAddress,
                amountIn=amountInWei,
                amountOutMin=amountOutWei,
                swappingToGas=True,
                rpcURL=recipe[direction]["chain"]["rpc"],
                explorerUrl=recipe[direction]["chain"]["blockExplorer"],
                routerAddress=recipe[direction]["chain"]["uniswapRouter"],
                factoryAddress=recipe[direction]["chain"]["uniswapFactory"],
                justGetQuote=True
            )

        except Exception as err:
            errMsg = f'Error topping up {direction} ({recipe[direction]["chain"]["name"]}) wallet with gas: {err}'
            logger.error(errMsg)
            sys.exit(errMsg)

        recipe[direction]["wallet"]["balances"]["gas"] = getWalletGasBalance(
            recipe[direction]["chain"]["rpc"],
            recipe[direction]["wallet"]["address"],
            recipe[direction]["gas"]["symbol"],
            False
        )

        # Data.addFee(recipe=recipe, amount=float(transactionSummary["fee"]), section="originGas")

        logger.info(f'{direction} wallet ({recipe[direction]["chain"]["name"]}) topped up successful - new balance is {recipe[direction]["wallet"]["balances"]["gas"]} {recipe[direction]["gas"]["symbol"]}')
    else:
        logger.info(f"Origin wallet has enough gas")

    return recipe