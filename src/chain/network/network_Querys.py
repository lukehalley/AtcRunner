from decimal import Decimal

from retry import retry
from web3 import Web3

from src.utils.chain.chain_ABI import getMappedContractFunction, fillEmptyABIParams
from src.utils.chain.chain_Addresses import checkWalletsMatch
from src.utils.chain.chain_Wallet import getPrivateKey, checkIfStablesAreOnOrigin
from src.utils.chain.chain_Wei import getTokenNormalValue
from src.utils.logging.logging_Setup import getProjectLogger
from src.utils.retry.retry_Params import getRetryParams

from src.chain.contract.contract_ERC20 import getBalanceOfToken, convertWeiToETH

logger = getProjectLogger()

transactionRetryLimit, transactionRetryDelay = getRetryParams(retryType="transactionQuery")

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getNetworkWETH(chainDetails):
    from src.chain.network.network_Actions import callMappedContractFunction

    rpcUrl = chainDetails["rpc"]
    routerAddress = chainDetails["contracts"]["router"]["address"]
    routerABI = chainDetails["contracts"]["router"]["abi"]
    routerABIMappings = chainDetails["contracts"]["router"]["mapping"]

    w3 = Web3(Web3.HTTPProvider(rpcUrl))

    wethFunctionName = getMappedContractFunction(functionName="WETH", abiMapping=routerABIMappings)
    routerABI = fillEmptyABIParams(abi=routerABI, contractFunctionName=wethFunctionName)

    contract_address = Web3.toChecksumAddress(routerAddress)
    contract = w3.eth.contract(contract_address, abi=routerABI)

    return callMappedContractFunction(contract=contract, functionToCall=wethFunctionName)

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getWalletAddressFromPrivateKey(rpcURL):
    w3 = Web3(Web3.HTTPProvider(rpcURL))
    privateKey = getPrivateKey()
    return w3.eth.account.privateKeyToAccount(privateKey).address

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getGasPrice(rpcURL):
    # Connect to our RPC.
    w3 = Web3(Web3.HTTPProvider(rpcURL))

    gasPrice = Decimal(w3.fromWei(w3.eth.gas_price, 'gwei'))

    return gasPrice

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getTokenBalance(rpcURL, tokenAddress, tokenDecimals, wethContractABI):
    walletAddress = getWalletAddressFromPrivateKey(rpcURL=rpcURL)

    balanceWei = getBalanceOfToken(
        rpc_address=rpcURL,
        address=walletAddress,
        token_address=tokenAddress,
        wethContractABI=wethContractABI
    )

    balance = getTokenNormalValue(amount=balanceWei, decimalPlaces=tokenDecimals)

    return Decimal(balance)

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getWalletsInformation(recipe, printBalances=False):
    directionList = ("origin", "destination")

    for direction in directionList:

        recipe[direction]["wallet"] = {}

        recipe[direction]["wallet"]["address"] = getWalletAddressFromPrivateKey(recipe[direction]["chain"]["rpc"])

        recipe[direction]["wallet"]["balances"] = {}

        recipe[direction]["wallet"]["balances"]["gas"] = getWalletGasBalance(
            rpcURL=recipe[direction]["chain"]["rpc"],
            walletAddress=recipe[direction]["wallet"]["address"],
            wethContractABI=recipe[direction]["chain"]["contracts"]["weth"]["abi"]
        )

        recipe[direction]["wallet"]["balances"]["stablecoin"] = getTokenBalance(
            rpcURL=recipe[direction]["chain"]["rpc"],
            tokenAddress=recipe[direction]["stablecoin"]["address"],
            tokenDecimals=recipe[direction]["stablecoin"]["decimals"],
            wethContractABI=recipe[direction]["chain"]["contracts"]["weth"]["abi"]
        )

        tokenIsGas = recipe[direction]["token"]["isGas"]

        if tokenIsGas:

            gasUpperLimit = recipe[direction]["chain"]["gasDetails"]["gasLimits"]["maxGas"]

            trueTokenBalance = recipe[direction]["wallet"]["balances"]["gas"]
            limitedTokenBalance = abs(trueTokenBalance - recipe[direction]["chain"]["gasDetails"]["gasLimits"]["maxGas"])

            recipe[direction]["wallet"]["balances"]["token"] = limitedTokenBalance

            if trueTokenBalance > gasUpperLimit:
                recipe[direction]["wallet"]["balances"]["gas"] = gasUpperLimit

        else:
            recipe[direction]["wallet"]["balances"]["token"] = getTokenBalance(
                rpcURL=recipe[direction]["chain"]["rpc"],
                tokenAddress=recipe[direction]["token"]["address"],
                tokenDecimals=recipe[direction]["token"]["decimals"],
                wethContractABI=recipe[direction]["chain"]["contracts"]["weth"]["abi"]
            )

        if printBalances:
            logger.info(
                f'{direction.title()} ({recipe[direction]["chain"]["name"]}): '
                f'Token {round(recipe[direction]["wallet"]["balances"]["token"], 6)} {recipe[direction]["token"]["name"]} | '
                f'Gas {round(recipe[direction]["wallet"]["balances"]["gas"], 6)} {recipe[direction]["gas"]["symbol"]} | '
                f'Stables {round(recipe[direction]["wallet"]["balances"]["stablecoin"], 6)} {recipe[direction]["stablecoin"]["symbol"]}'
            )

    checkWalletsMatch(recipe)

    recipe["status"]["stablesAreOnOrigin"] = checkIfStablesAreOnOrigin(recipe)

    return recipe

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getWalletGasBalance(rpcURL, walletAddress, wethContractABI):
    w3 = Web3(Web3.HTTPProvider(rpcURL))

    balance = convertWeiToETH(w3, getBalanceOfToken(address=walletAddress, rpc_address=rpcURL, wethContractABI=wethContractABI, getGasTokenBalance=True))

    return Decimal(balance)

def getTokenApprovalStatus(rpcUrl, walletAddress, tokenAddress, spenderAddress, wethAbi):
    web3 = Web3(Web3.HTTPProvider(rpcUrl))

    contract = tokenAddress
    contract = web3.toChecksumAddress(contract)

    contract = web3.eth.contract(address=contract, abi=wethAbi)

    _owner = web3.toChecksumAddress(walletAddress)
    _spender = web3.toChecksumAddress(spenderAddress)

    isApproved = contract.functions.allowance(_owner, _spender).call()
    isApprovedBool = bool(isApproved)

    return isApprovedBool
