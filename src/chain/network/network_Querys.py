import os
import sys
from decimal import Decimal

from retry import retry
from web3 import Web3

from src.utils.chain.chain_ABI import getMappedContractFunction, fillEmptyABIParams
from src.utils.chain.chain_Addresses import checkWalletsMatch
from src.utils.chain.chain_Wallet import getPrivateKey, checkIfStablesAreOnOrigin
from src.utils.chain.chain_Wei import getTokenNormalValue
from src.utils.logging.logging_Print import printSeparator
from src.utils.logging.logging_Setup import getProjectLogger
from src.utils.retry.retry_Params import getRetryParams

from src.chain.contract.contract_ERC20 import getBalanceOfToken, convertWeiToETH

logger = getProjectLogger()

transactionRetryLimit, transactionRetryDelay = getRetryParams(retryType="transactionQuery")

def getNetworkWETH(chainRecipe):
    from src.chain.network.network_Actions import callMappedContractFunction

    rpcUrl = chainRecipe["chain"]["rpc"]
    primaryDex = chainRecipe["chain"]["primaryDex"]

    # We can always use the first dex to get the network ETH as they all will have this function
    routerAddress = chainRecipe["dexs"][primaryDex]["contracts"]["router"]["address"]
    routerABI = chainRecipe["dexs"][primaryDex]["contracts"]["router"]["abi"]
    routerABIMappings = chainRecipe["dexs"][primaryDex]["contracts"]["router"]["mapping"]

    web3 = Web3(Web3.HTTPProvider(rpcUrl))

    wethFunctionName = getMappedContractFunction(functionName="WETH", abiMapping=routerABIMappings)
    routerABI = fillEmptyABIParams(abi=routerABI, contractFunctionName=wethFunctionName)

    contract_address = Web3.toChecksumAddress(routerAddress)
    contract = web3.eth.contract(contract_address, abi=routerABI)

    return callMappedContractFunction(contract=contract, functionToCall=wethFunctionName)

def getWalletAddressFromPrivateKey(rpcUrl):
    web3 = Web3(Web3.HTTPProvider(rpcUrl))
    privateKey = getPrivateKey()
    return web3.eth.account.privateKeyToAccount(privateKey).address

def getGasPrice(rpcUrl):
    # Connect to our RPC.
    web3 = Web3(Web3.HTTPProvider(rpcUrl))

    gasPrice = Decimal(web3.fromWei(web3.eth.gas_price, 'gwei'))

    return gasPrice

def getTokenBalance(fromChainRPCUrl, tokenAddress, tokenDecimals, wethContractABI):
    walletAddress = getWalletAddressFromPrivateKey(rpcUrl=fromChainRPCUrl)

    balanceWei = getBalanceOfToken(
        rpc_address=fromChainRPCUrl,
        address=walletAddress,
        token_address=tokenAddress,
        wethContractABI=wethContractABI
    )

    balance = getTokenNormalValue(amount=balanceWei, decimalPlaces=tokenDecimals)

    return Decimal(balance)

def getWalletsInformation(recipe, printBalances=False):

    directionList = ("origin", "destination")

    for direction in directionList:
        recipe[direction]["wallet"] = {}
        recipe[direction]["wallet"]["address"] = getWalletAddressFromPrivateKey(recipe[direction]["chain"]["rpc"])

    if printBalances:
        printSeparator()
        logger.info(
            f'Wallet Address: {recipe[directionList[0]]["wallet"]["address"]}'
        )

    for direction in directionList:

        recipe[direction]["wallet"]["balances"] = {}

        primaryDex = recipe[direction]["chain"]["primaryDex"]

        recipe[direction]["wallet"]["balances"]["gas"] = getWalletGasBalance(
            rpcUrl=recipe[direction]["chain"]["rpc"],
            walletAddress=recipe[direction]["wallet"]["address"],
            wethContractABI=recipe[direction]["dexs"][primaryDex]["contracts"]["weth"]["abi"]
        )

        recipe[direction]["wallet"]["balances"]["stablecoin"] = getTokenBalance(
            fromChainRPCUrl=recipe[direction]["chain"]["rpc"],
            tokenAddress=recipe[direction]["stablecoin"]["address"],
            tokenDecimals=recipe[direction]["stablecoin"]["decimals"],
            wethContractABI=recipe[direction]["dexs"][primaryDex]["contracts"]["weth"]["abi"]
        )

        tokenIsGas = recipe[direction]["token"]["isGas"]

        if tokenIsGas:

            maximumGasBalance = Decimal(recipe[direction]["chain"]["gasDetails"]["gasLimits"]["maxGas"])
            minimumGasBalance = Decimal(recipe[direction]["chain"]["gasDetails"]["gasLimits"]["minGas"])

            currentGasBalance = recipe[direction]["wallet"]["balances"]["gas"]

            if currentGasBalance < minimumGasBalance:
                sys.exit(f"Current Gas Balance ({currentGasBalance}) Below Minimum Limit ({minimumGasBalance})")

            if currentGasBalance > maximumGasBalance:
                recipe[direction]["wallet"]["balances"]["token"] = abs(currentGasBalance - maximumGasBalance)
                recipe[direction]["wallet"]["balances"]["gas"] = maximumGasBalance
            else:
                recipe[direction]["wallet"]["balances"]["token"] = 0

        else:
            recipe[direction]["wallet"]["balances"]["token"] = getTokenBalance(
                fromChainRPCUrl=recipe[direction]["chain"]["rpc"],
                tokenAddress=recipe[direction]["token"]["address"],
                tokenDecimals=recipe[direction]["token"]["decimals"],
                wethContractABI=recipe[direction]["dexs"][primaryDex]["contracts"]["weth"]["abi"]
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

def getWalletGasBalance(rpcUrl, walletAddress, wethContractABI):
    web3 = Web3(Web3.HTTPProvider(rpcUrl))

    balance = convertWeiToETH(web3, getBalanceOfToken(address=walletAddress, rpc_address=rpcUrl,
                                                      wethContractABI=wethContractABI, getGasTokenBalance=True))

    return Decimal(balance)


def getTokenApprovalStatus(recipe, recipePosition, tokenType, spenderAddress):
    # Dict Params ####################################################
    rpcUrl = recipe[recipePosition]["chain"]["rpc"]
    walletAddress = recipe[recipePosition]["wallet"]["address"]
    tokenAddress = recipe[recipePosition][tokenType]["address"]
    wethAbi = recipe[recipePosition]["chain"]["contracts"]["weth"]["abi"]
    # Dict Params ####################################################

    # Setup Web 3
    web3 = Web3(Web3.HTTPProvider(rpcUrl))

    # Get The Token Contract Which We Are Approving
    contract = web3.eth.contract(
        address=web3.toChecksumAddress(tokenAddress),
        abi=wethAbi
    )

    # Get The Token Owner + Spender Address
    tokenOwner = web3.toChecksumAddress(walletAddress)
    tokenSpender = web3.toChecksumAddress(spenderAddress)

    # Call The 'allowance' Contract Function To See If The Token Is Approved
    isApproved = bool(contract.functions.allowance(tokenOwner, tokenSpender).call())

    return isApproved
