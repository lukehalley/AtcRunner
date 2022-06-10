"""
Automated Market Making liquidity pair.
https://docs.uniswap.org/protocol/V2/reference/smart-contracts/pair
"""

from web3 import Web3
from .utils.utils import swap_expected_amount1
from srco import Utils

ABI = Utils.getABI("IUniswapV2Pair.json")

def block_explorer_link(txid):
    return 'https://explorer.harmony.one/tx/' + str(txid)


def swap(pool_address, amount0_out, amount1_out, to, private_key, nonce, gas_price_gwei, tx_timeout_seconds, rpc_address, logger):
    w3 = Web3(Web3.HTTPProvider(rpc_address))
    account = w3.eth.account.privateKeyToAccount(private_key)
    w3.eth.default_account = account.address

    contract_address = Web3.toChecksumAddress(pool_address)
    contract = w3.eth.contract(contract_address, abi=ABI)

    tx = contract.functions.startQuestWithData(amount0_out, amount1_out, to, None).buildTransaction(
        {'gasPrice': w3.toWei(gas_price_gwei, 'gwei'), 'nonce': nonce})

    logger.debug("Signing transaction")
    signed_tx = w3.eth.account.sign_transaction(tx, private_key=private_key)
    logger.debug("Sending transaction " + str(tx))
    ret = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    logger.debug("Transaction successfully sent !")
    logger.info(
        "Waiting for transaction " + block_explorer_link(signed_tx.hash.hex()) + " to be mined")

    tx_receipt = w3.eth.wait_for_transaction_receipt(transaction_hash=signed_tx.hash, timeout=tx_timeout_seconds,
                                                     poll_latency=2)
    logger.info("Transaction mined !")

    return tx_receipt


def name(pool_address, rpc_address):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(pool_address)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.symbol().call()


def symbol(pool_address, rpc_address):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(pool_address)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.symbol().call()


def token_0(pool_address, rpc_address):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(pool_address)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.token0().call()


def token_1(pool_address, rpc_address):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(pool_address)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.token1().call()


def decimals(pool_address, rpc_address):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(pool_address)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.decimals().call()


def total_supply(pool_address, rpc_address):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(pool_address)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.totalSupply().call()


def get_reserves(pool_address, rpc_address):
    '''
    Returns the reserves of token0 and token1 used to price trades and distribute liquidity.
    Also returns the block.timestamp (mod 2**32) of the last block during which an interaction occurred for the pair.
    :param pool_address:
    :param rpc_address:
    :return: reserve0, reserve1, blockTimestampLast
    '''
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(pool_address)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.getReserves().call()


def balance_of(pool_address, owner_address, rpc_address):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(pool_address)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.balanceOf(owner_address).call()


def price_0_cumulative_last(pool_address, rpc_address):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(pool_address)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.price0CumulativeLast().call()


def price_1_cumulative_last(pool_address, rpc_address):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(pool_address)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.price1CumulativeLast().call()


class UniswapV2Pair:
    def __init__(self, pair_address, rpc_address, logger):
        self.address = pair_address
        self.rpc_address = rpc_address
        self.logger = logger

        self.symbol_value = None
        self.token_0_value = None
        self.token_1_value = None

    def symbol(self):
        if self.symbol_value is None:
            self.symbol_value = symbol(self.address, self.rpc_address)
        return self.symbol_value

    def token_0(self):
        if self.token_0_value is None:
            self.token_0_value = token_0(self.address, self.rpc_address)
        return self.token_0_value

    def token_1(self):
        if self.token_1_value is None:
            self.token_1_value = token_1(self.address, self.rpc_address)
        return self.token_1_value

    def decimals(self):
        return decimals(self.address, self.rpc_address)

    def total_supply(self):
        return total_supply(self.address, self.rpc_address)

    def reserves(self):
        return get_reserves(self.address, self.rpc_address)

    def balance_of(self, address):
        return balance_of(self.address, address, self.rpc_address)

    def price_0_cumulative_last(self):
        return price_0_cumulative_last(self.address, self.rpc_address)

    def price_1_cumulative_last(self):
        return price_1_cumulative_last(self.address, self.rpc_address)

    def expected_amount1(self, amount0):
        reserves = get_reserves(self.address, self.rpc_address)
        return swap_expected_amount1(reserves[0], reserves[1], amount0)

    def expected_amount0(self, amount1):
        reserves = get_reserves(self.address, self.rpc_address)
        return swap_expected_amount1(reserves[1], reserves[0], amount1)