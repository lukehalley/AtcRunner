import sys

from helpers import Bridge, Utils
import dex.uniswap_v2_pair as Pair
import dex.uniswap_v2_factory as Factory

from web3 import Web3

ABI = Utils.getABI("IUniswapV2Router02.json")

def block_explorer_link(url, txid):
    return url + "/" + str(txid)


def weth(rpc_address, routerAddress):
    '''
    Return the wrapped address of the native token of the blockchain
    :param rpc_address:
    :return:
    '''

    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(routerAddress)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.WETH().call()


def factory(rpc_address, routerAddress):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(routerAddress)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.factory().call()


def quote(amount_a, reserve_a, reserve_b, rpc_address, routerAddress):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(routerAddress)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.quote(amount_a, reserve_a, reserve_b).call()


def get_amount_in(amount_out, reserve_in, reserve_out, rpc_address, routerAddress):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(routerAddress)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.getAmountIn(amount_out, reserve_in, reserve_out).call()


def get_amount_out(amount_in, reserve_in, reserve_out, rpc_address, routerAddress):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(routerAddress)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.getAmountOut(amount_in, reserve_in, reserve_out).call()

def swapTokensGeneric(justGetQuote, swappingToGas, amount_in, path, to, deadline, private_key, nonce, gas_price_gwei, tx_timeout_seconds, rpc_address, factoryAddress, routerAddress, explorerUrl, logger, amount_out_min=0, gas=250000):
    '''
    Swaps an exact amount of tokens for as much ETH as possible, along the route determined by the path.
    The first element of path is the input token, the last must be WETH, and any intermediate elements represent
     intermediate pairs to trade through (if, for example, a direct pair does not exist).
    :param amount_in:
    :param amount_out_min:
    :param path:
    :param to:
    :param deadline:
    :param private_key:
    :param nonce:
    :param gas_price_gwei:
    :param tx_timeout_seconds:
    :param rpc_address:
    :param logger:
    :return:
    '''
    w3 = Web3(Web3.HTTPProvider(rpc_address))
    account = w3.eth.account.privateKeyToAccount(private_key)
    w3.eth.default_account = account.address

    contract = w3.eth.contract(routerAddress, abi=ABI)

    txParams = {
        'gasPrice': w3.toWei(gas_price_gwei, 'gwei'),
        'nonce': nonce,
        'gas': gas
    }

    if swappingToGas:
        tx = contract.functions.swapExactTokensForETH(amount_in, amount_out_min, path, to, deadline).buildTransaction(txParams)
    else:
        tx = contract.functions.swapExactTokensForTokens(amount_in, amount_out_min, path, to, deadline).buildTransaction(txParams)

    logger.debug("Signing transaction...")
    signed_tx = w3.eth.account.sign_transaction(tx, private_key=private_key)
    logger.debug("Transaction signed!")

    if not justGetQuote:

        logger.info("Sending transaction...")
        w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        logger.info("Transaction successfully sent!")

        logger.info("Waiting for transaction to be mined...")
        tx_receipt = w3.eth.wait_for_transaction_receipt(transaction_hash=signed_tx.hash, timeout=tx_timeout_seconds,
                                                         poll_latency=2)

        explorerLink = block_explorer_link(explorerUrl, signed_tx.hash.hex())
        logger.info(f"Transaction was mined: {explorerLink}")

        txWasSuccessful = tx_receipt["status"] == 1

        if txWasSuccessful:
            logger.info(f"✅ Transaction was successful: {explorerLink}")

            result = {
                "successfull": txWasSuccessful,
                "fee": Bridge.getTokenNormalValue(tx_receipt["gasUsed"] * w3.toWei(gas_price_gwei, 'gwei'), 18),
                "blockURL": explorerLink,
                "hash": signed_tx.hash.hex()
            }

        else:
            errMsg = f'⛔️ Transaction was unsuccessful: {explorerLink}'
            logger.error(errMsg)
            sys.exit(errMsg)

        return result

    else:
        one = Web3.toChecksumAddress(path[0])
        two = Web3.toChecksumAddress(path[1])
        pairAddress = Factory.get_pair(token_address_1=one, token_address_2=two, rpc_address=rpc_address, factoryAddress=factoryAddress)

        pairReserves = Pair.get_reserves(pairAddress, rpc_address)

        result = get_amount_out(
            amount_in=amount_in,
            reserve_in=pairReserves[0],
            reserve_out=pairReserves[1],
            rpc_address=rpc_address,
            routerAddress=routerAddress
        )

        return result


