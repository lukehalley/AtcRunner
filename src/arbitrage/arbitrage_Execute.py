from src.apis.firebaseDB.firebaseDB_Querys import fetchArbitrageStrategy
from src.apis.telegramBot.telegramBot_Action import appendToMessage, updateStatusMessage
from src.arbitrage.arbitrage_Simulate import simulateStep

from src.utils.chain.chain_Calculations import getOppositeDirection, getValueWithSlippage
from src.utils.files.files_Directory import printSeperator, percentageDifference, printArbitrageRollbackComplete, printArbitrageResult, truncateDecimal, getProjectLogger
from src.wallet.actions.bridge import executeBridge
from src.wallet.actions.network import topUpWalletGas, checkAndApproveToken
from src.wallet.actions.swap import swapToken, setupWallet
from src.wallet.queries.network import getWalletsInformation
from src.wallet.queries.swap import getSwapQuoteOut

# Set up our logging
logger = getProjectLogger()

# Execute an Arbitrage
def executeArbitrage(recipe, predictions, startingTime, telegramStatusMessage):
    steps = fetchArbitrageStrategy(strategyName="networkBridge")

    printSeperator()
    logger.info(f"[ARB #{recipe['arbitrage']['currentRoundTripCount']}] "
                f"Executing Arbitrage")
    printSeperator()

    recipe = getWalletsInformation(recipe)

    startingStables = recipe["origin"]["wallet"]["balances"]["stablecoin"]

    recipe["status"]["startingStables"] = startingStables

    currentFunds = {
        "stablecoin": startingStables,
        "token": 0
    }

    for stepSettings in steps:

        stepType = stepSettings["type"]
        stepNumber = steps.index(stepSettings) + 1
        stepName = stepSettings["name"]

        position = stepSettings["position"]
        oppositePosition = getOppositeDirection(position)
        toSwapFrom = stepSettings["from"]
        toSwapTo = stepSettings["to"]

        recipe, toppedUpOccured, telegramStatusMessage = topUpWalletGas(
            recipe=recipe,
            direction=position,
            toSwapFrom=toSwapFrom,
            telegramStatusMessage=telegramStatusMessage,
        )

        if toppedUpOccured:
            currentFunds["stablecoin"] = recipe[position]["wallet"]["balances"]["stablecoin"]
            currentFunds["token"] = recipe[position]["wallet"]["balances"]["token"]

        recipe = getWalletsInformation(recipe)

        if stepNumber <= 1:
            logger.info(f'Starting Capital: {currentFunds["stablecoin"]} {recipe[position]["stablecoin"]["name"]}')
            printSeperator(True)

        if toSwapTo != "done":

            recipe = getWalletsInformation(recipe)

            printSeperator()

            logger.info(
                f'{stepNumber}. {stepType.title()} {truncateDecimal(currentFunds[toSwapFrom], 6)} {recipe[position][toSwapFrom]["name"]} -> {recipe[position][toSwapTo]["name"]}')

            telegramStatusMessage = appendToMessage(originalMessage=telegramStatusMessage,
                                                    messageToAppend=f"{stepNumber}. Doing {position.title()} {stepType.title()} -> 📤")

            if stepType == "swap":

                swapRoute = recipe[position]["routes"][f"{toSwapFrom}-{toSwapTo}"]

                amountOutQuoted = getSwapQuoteOut(
                    amountInNormal=currentFunds[toSwapFrom],
                    amountInDecimals=recipe[position][toSwapFrom]["decimals"],
                    amountOutDecimals=recipe[position][toSwapTo]["decimals"],
                    rpcUrl=recipe[position]["chain"]["rpc"],
                    routerAddress=recipe[position]["chain"]["contracts"]["router"]["address"],
                    routerABI=recipe[position]["chain"]["contracts"]["router"]["abi"],
                    routerABIMappings=recipe[position]["chain"]["contracts"]["router"]["mapping"],
                    routes=swapRoute
                )

                amountOutMinWithSlippage = getValueWithSlippage(amount=amountOutQuoted, slippage=0.5)

                # if not recipe[position][toSwapFrom]["isGas"]:
                telegramStatusMessage = checkAndApproveToken(
                    recipe=recipe, position=position, toSwapFrom=toSwapFrom, stepNumber=stepNumber,
                    isSwap=True, telegramStatusMessage=telegramStatusMessage
                )

                recipe = getWalletsInformation(recipe)

                balanceBeforeSwap = recipe[position]["wallet"]["balances"][toSwapTo]

                swapResult = swapToken(
                    amountInNormal=currentFunds[toSwapFrom],
                    amountInDecimals=recipe[position][toSwapFrom]["decimals"],
                    amountOutNormal=amountOutMinWithSlippage,
                    amountOutDecimals=recipe[position][toSwapTo]["decimals"],
                    tokenPath=swapRoute,
                    rpcURL=recipe[position]["chain"]["rpc"],
                    arbitrageNumber=recipe["arbitrage"]["currentRoundTripCount"],
                    stepCategory=f"{stepNumber}_swap",
                    explorerUrl=recipe[position]["chain"]["blockExplorer"]["txBaseURL"],
                    routerAddress=recipe[position]["chain"]["contracts"]["router"]["address"],
                    routerABI=recipe[position]["chain"]["contracts"]["router"]["abi"],
                    routerABIMappings=recipe[position]["chain"]["contracts"]["router"]["mapping"],
                    wethContractABI=recipe[position]["chain"]["contracts"]["weth"]["abi"],
                    telegramStatusMessage=telegramStatusMessage,
                    swappingFromGas=recipe[position][toSwapFrom]["isGas"],
                    swappingToGas=recipe[position][toSwapTo]["isGas"]
                )

                recipe = getWalletsInformation(recipe)

                balanceAfterSwap = recipe[position]["wallet"]["balances"][toSwapTo]

                while balanceAfterSwap == balanceBeforeSwap:
                    recipe = getWalletsInformation(recipe)
                    balanceAfterSwap = recipe[position]["wallet"]["balances"][toSwapTo]

                result = balanceAfterSwap - balanceBeforeSwap

                currentFunds[toSwapTo] = result

                telegramStatusMessage = swapResult["telegramStatusMessage"]

            elif stepType == "bridge":

                if stepName == "destinationBridge":

                    quote = simulateStep(recipe=recipe, stepSettings=stepSettings, currentFunds=currentFunds)

                    if quote < startingStables:
                        telegramStatusMessage = appendToMessage(originalMessage=telegramStatusMessage,
                                                                messageToAppend=f"Rolling Back Arbitrage #{recipe['arbitrage']['currentRoundTripCount']} ‍⏮")

                        wasProfitable, telegramStatusMessage = rollbackArbitrage(recipe=recipe,
                                                                                 currentFunds=currentFunds,
                                                                                 startingStables=startingStables,
                                                                                 startingTime=startingTime,
                                                                                 telegramStatusMessage=telegramStatusMessage)

                        return wasProfitable

                if not recipe[position][toSwapFrom]["isGas"]:
                    telegramStatusMessage = checkAndApproveToken(
                        recipe=recipe, position=position, toSwapFrom=toSwapFrom, stepNumber=stepNumber,
                        isSwap=False, telegramStatusMessage=telegramStatusMessage
                    )

                recipe = getWalletsInformation(recipe)

                balanceBeforeBridge = recipe[oppositePosition]["wallet"]["balances"][toSwapFrom]

                bridgeResult = executeBridge(
                    amountToBridge=currentFunds[toSwapFrom],
                    fromChain=recipe[position]["chain"]["id"],
                    fromTokenAddress=recipe[position][toSwapFrom]['address'],
                    fromTokenDecimals=recipe[position][toSwapFrom]["decimals"],
                    fromChainRPCURL=recipe[position]["chain"]["rpc"],
                    toChain=recipe[oppositePosition]["chain"]["id"],
                    toTokenDecimals=recipe[oppositePosition][toSwapFrom]['decimals'],
                    toTokenAddress=recipe[oppositePosition][toSwapFrom]['address'],
                    toChainRPCURL=recipe[oppositePosition]["chain"]["rpc"],
                    wethContractABI=recipe[position]["chain"]["contracts"]["weth"]["abi"],
                    arbitrageNumber=recipe["arbitrage"]["currentRoundTripCount"],
                    stepCategory=f"{stepNumber}_bridge",
                    explorerUrl=recipe[position]["chain"]["blockExplorer"]["txBaseURL"],
                    telegramStatusMessage=telegramStatusMessage,
                    predictions=predictions,
                    stepNumber=stepNumber
                )

                recipe = getWalletsInformation(recipe)
                balanceAfterBridge = recipe[oppositePosition]["wallet"]["balances"][toSwapFrom]

                while balanceAfterBridge == balanceBeforeBridge:
                    recipe = getWalletsInformation(recipe)
                    balanceAfterBridge = recipe[oppositePosition]["wallet"]["balances"][toSwapFrom]

                result = balanceAfterBridge - balanceBeforeBridge

                currentFunds[toSwapFrom] = result

                telegramStatusMessage = bridgeResult["telegramStatusMessage"]

            else:
                updateStatusMessage(originalMessage=telegramStatusMessage, newStatus="⛔️")
                errMsg = f'Invalid Arbitrage execution type: {stepType}'
                logger.error(errMsg)
                raise Exception(errMsg)

            recipe = getWalletsInformation(recipe)

            printSeperator()

            logger.info(f'Output: {truncateDecimal(result, 6)} {recipe[position][toSwapTo]["name"]}')
            telegramStatusMessage = updateStatusMessage(originalMessage=telegramStatusMessage, newStatus="✅")

            stepSettings["done"] = True

            printSeperator(True)

        else:

            recipe = getWalletsInformation(recipe)

            wasProfitable = recipe[position]["wallet"]["balances"]["stablecoin"] > startingStables
            profitLoss = abs(recipe[position]["wallet"]["balances"]["stablecoin"] - startingStables)

            if wasProfitable:
                arbitragePercentage = percentageDifference(recipe[position]["wallet"]["balances"]["stablecoin"],
                                                           startingStables, 2)
            else:
                arbitragePercentage = percentageDifference(startingStables,
                                                           recipe[position]["wallet"]["balances"]["stablecoin"], 2)

            printArbitrageResult(count=recipe["arbitrage"]["currentRoundTripCount"], amount=profitLoss,
                                 percentageDifference=arbitragePercentage, wasProfitable=wasProfitable,
                                 startingTime=startingTime, telegramStatusMessage=telegramStatusMessage)

            return wasProfitable

# Rollback an Arbitrage
def rollbackArbitrage(recipe, currentFunds, startingStables, startingTime, telegramStatusMessage):
    steps = fetchArbitrageStrategy(strategyName="networkBridgeRollback")

    printSeperator(True)

    printSeperator()
    logger.info(f"[ARB #{recipe['arbitrage']['currentRoundTripCount']}] "
                f"Rolling Back Arbitrage")
    printSeperator(True)

    normalStepCount = 4

    for stepSettings in steps:

        printSeperator()

        stepType = stepSettings["type"]
        stepNumber = steps.index(stepSettings) + 1 + normalStepCount

        position = stepSettings["position"]
        oppositePosition = getOppositeDirection(position)
        toSwapFrom = stepSettings["from"]
        toSwapTo = stepSettings["to"]

        recipe, toppedUpOccured, telegramStatusMessage = topUpWalletGas(
            recipe=recipe,
            direction=position,
            toSwapFrom=toSwapFrom,
            telegramStatusMessage=telegramStatusMessage,
        )

        if toppedUpOccured:
            currentFunds["stablecoin"] = recipe[position]["wallet"]["balances"]["stablecoin"]
            currentFunds["token"] = recipe[position]["wallet"]["balances"]["token"]

        recipe = getWalletsInformation(recipe)

        recipe = getWalletsInformation(recipe)

        logger.info(
            f'{stepNumber}. {stepType.title()} {truncateDecimal(currentFunds[toSwapFrom], 6)} {recipe[position][toSwapFrom]["name"]} -> {recipe[position][toSwapTo]["name"]}')

        telegramStatusMessage = appendToMessage(originalMessage=telegramStatusMessage,
                                                messageToAppend=f"{stepNumber}. RBack {position.title()} {stepType.title()} -> 📤")

        if stepType == "swap":

            balanceBeforeSwap = recipe[position]["wallet"]["balances"][toSwapTo]

            swapRoute = recipe[position]["routes"][f"{toSwapFrom}-{toSwapTo}"]

            amountOutQuoted = getSwapQuoteOut(
                amountInNormal=currentFunds[toSwapFrom],
                amountInDecimals=recipe[position][toSwapFrom]["decimals"],
                amountOutDecimals=recipe[position][toSwapTo]["decimals"],
                rpcUrl=recipe[position]["chain"]["rpc"],
                routerAddress=recipe[position]["chain"]["contracts"]["router"]["address"],
                routerABI=recipe[position]["chain"]["contracts"]["router"]["abi"],
                routerABIMappings=recipe[position]["chain"]["contracts"]["router"]["mapping"],
                routes=swapRoute
            )

            amountOutMinWithSlippage = getValueWithSlippage(amount=amountOutQuoted, slippage=0.5)

            telegramStatusMessage = checkAndApproveToken(
                recipe=recipe, position=position, toSwapFrom=toSwapFrom, stepNumber=stepNumber,
                isSwap=True, telegramStatusMessage=telegramStatusMessage
            )

            swapResult = swapToken(
                amountInNormal=currentFunds[toSwapFrom],
                amountInDecimals=recipe[position][toSwapFrom]["decimals"],
                amountOutNormal=amountOutMinWithSlippage,
                amountOutDecimals=recipe[position][toSwapTo]["decimals"],
                tokenPath=swapRoute,
                rpcURL=recipe[position]["chain"]["rpc"],
                arbitrageNumber=recipe["arbitrage"]["currentRoundTripCount"],
                stepCategory=f"{stepNumber}_swap",
                explorerUrl=recipe[position]["chain"]["blockExplorer"]["txBaseURL"],
                routerAddress=recipe[position]["chain"]["contracts"]["router"]["address"],
                routerABI=recipe[position]["chain"]["contracts"]["router"]["abi"],
                routerABIMappings=recipe[position]["chain"]["contracts"]["router"]["mapping"],
                wethContractABI=recipe[position]["chain"]["contracts"]["weth"]["abi"],
                telegramStatusMessage=telegramStatusMessage,
                swappingFromGas=recipe[position][toSwapFrom]["isGas"],
                swappingToGas=recipe[position][toSwapTo]["isGas"]
            )

            recipe = getWalletsInformation(recipe)

            balanceAfterSwap = recipe[position]["wallet"]["balances"][toSwapTo]

            while balanceAfterSwap == balanceBeforeSwap:
                recipe = getWalletsInformation(recipe)
                balanceAfterSwap = recipe[position]["wallet"]["balances"][toSwapTo]

            result = balanceAfterSwap - balanceBeforeSwap

            currentFunds[toSwapTo] = result

            telegramStatusMessage = swapResult["telegramStatusMessage"]

        elif stepType == "bridge":

            balanceBeforeBridge = recipe[oppositePosition]["wallet"]["balances"][toSwapFrom]

            telegramStatusMessage = checkAndApproveToken(
                recipe=recipe, position=position, toSwapFrom=toSwapFrom, stepNumber=stepNumber,
                isSwap=False, telegramStatusMessage=telegramStatusMessage
            )

            bridgeResult = executeBridge(
                amountToBridge=currentFunds[toSwapFrom],
                fromChain=recipe[position]["chain"]["id"],
                fromTokenAddress=recipe[position][toSwapFrom]['address'],
                fromTokenDecimals=recipe[position][toSwapFrom]["decimals"],
                fromChainRPCURL=recipe[position]["chain"]["rpc"],
                toChain=recipe[oppositePosition]["chain"]["id"],
                toTokenDecimals=recipe[oppositePosition][toSwapFrom]['decimals'],
                toTokenAddress=recipe[oppositePosition][toSwapFrom]['address'],
                toChainRPCURL=recipe[oppositePosition]["chain"]["rpc"],
                wethContractABI=recipe[position]["chain"]["contracts"]["weth"]["abi"],
                arbitrageNumber=recipe["arbitrage"]["currentRoundTripCount"],
                stepCategory=f"{stepNumber}_bridge",
                explorerUrl=recipe[position]["chain"]["blockExplorer"]["txBaseURL"],
                telegramStatusMessage=telegramStatusMessage,
                predictions=None,
                stepNumber=stepNumber
            )

            recipe = getWalletsInformation(recipe)
            balanceAfterBridge = recipe[oppositePosition]["wallet"]["balances"][toSwapFrom]

            while balanceAfterBridge == balanceBeforeBridge:
                recipe = getWalletsInformation(recipe)
                balanceAfterBridge = recipe[oppositePosition]["wallet"]["balances"][toSwapFrom]

            result = balanceAfterBridge - balanceBeforeBridge

            currentFunds[toSwapFrom] = result

            telegramStatusMessage = bridgeResult["telegramStatusMessage"]

        else:
            updateStatusMessage(originalMessage=telegramStatusMessage, newStatus="⛔️")
            errMsg = f'Invalid Arbitrage execution type: {stepType}'
            logger.error(errMsg)
            raise Exception(errMsg)

        recipe = getWalletsInformation(recipe)

        printSeperator()

        logger.info(f'Output: {truncateDecimal(result, 6)} {recipe[position][toSwapTo]["name"]}')
        telegramStatusMessage = updateStatusMessage(originalMessage=telegramStatusMessage, newStatus="✅")

        stepSettings["done"] = True

        printSeperator(True)

    setupWallet(recipe=recipe)

    printSeperator(True)

    recipe = getWalletsInformation(recipe)

    wasProfitable = recipe["origin"]["wallet"]["balances"]["stablecoin"] > startingStables
    profitLoss = abs(recipe["origin"]["wallet"]["balances"]["stablecoin"] - startingStables)

    if wasProfitable:
        arbitragePercentage = percentageDifference(recipe["origin"]["wallet"]["balances"]["stablecoin"],
                                                   startingStables, 2)
    else:
        arbitragePercentage = percentageDifference(startingStables,
                                                   recipe["origin"]["wallet"]["balances"]["stablecoin"], 2)

    printArbitrageRollbackComplete(count=recipe["arbitrage"]["currentRoundTripCount"], wasProfitable=wasProfitable,
                                   profitLoss=profitLoss, arbitragePercentage=arbitragePercentage,
                                   startingTime=startingTime, telegramStatusMessage=telegramStatusMessage)

    return wasProfitable, telegramStatusMessage
