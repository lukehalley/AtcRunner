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

    web3 = Web3(Web3.HTTPProvider(rpcUrl))

    wethFunctionName = getMappedContractFunction(functionName="WETH", abiMapping=routerABIMappings)
    routerABI = fillEmptyABIParams(abi=routerABI, contractFunctionName=wethFunctionName)

    contract_address = Web3.toChecksumAddress(routerAddress)
    contract = web3.eth.contract(contract_address, abi=routerABI)

    return callMappedContractFunction(contract=contract, functionToCall=wethFunctionName)


@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getWalletAddressFromPrivateKey(rpcUrl):
    web3 = Web3(Web3.HTTPProvider(rpcUrl))
    privateKey = getPrivateKey()
    return web3.eth.account.privateKeyToAccount(privateKey).address


@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getGasPrice(rpcUrl):
    # Connect to our RPC.
    web3 = Web3(Web3.HTTPProvider(rpcUrl))

    gasPrice = Decimal(web3.fromWei(web3.eth.gas_price, 'gwei'))

    return gasPrice


@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getTokenBalance(rpcUrl, tokenAddress, tokenDecimals, wethContractABI):
    walletAddress = getWalletAddressFromPrivateKey(rpcUrl=rpcUrl)

    balanceWei = getBalanceOfToken(
        rpc_address=rpcUrl,
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
            rpcUrl=recipe[direction]["chain"]["rpc"],
            walletAddress=recipe[direction]["wallet"]["address"],
            wethContractABI=recipe[direction]["chain"]["contracts"]["weth"]["abi"]
        )

        recipe[direction]["wallet"]["balances"]["stablecoin"] = getTokenBalance(
            rpcUrl=recipe[direction]["chain"]["rpc"],
            tokenAddress=recipe[direction]["stablecoin"]["address"],
            tokenDecimals=recipe[direction]["stablecoin"]["decimals"],
            wethContractABI=recipe[direction]["chain"]["contracts"]["weth"]["abi"]
        )

        tokenIsGas = recipe[direction]["token"]["isGas"]

        if tokenIsGas:
            recipe[direction]["wallet"]["balances"]["token"] = recipe[direction]["wallet"]["balances"]["gas"]
        else:
            recipe[direction]["wallet"]["balances"]["token"] = getTokenBalance(
                rpcUrl=recipe[direction]["chain"]["rpc"],
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
