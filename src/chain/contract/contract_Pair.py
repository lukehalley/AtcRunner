from web3 import Web3

def getPairName(pool_address, rpc_address, ABI):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(pool_address)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.symbol().call()

def getPairSymbol(pool_address, rpc_address, ABI):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(pool_address)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.symbol().call()

def getPairToken0(pool_address, rpc_address, ABI):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(pool_address)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.token0().call()

def getPairToken1(pool_address, rpc_address, ABI):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(pool_address)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.token1().call()

def getPairDecimals(pool_address, rpc_address, ABI):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(pool_address)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.decimals().call()

def getPairTotalSupply(pool_address, rpc_address, ABI):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(pool_address)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.totalSupply().call()

def getPairReserves(pool_address, rpc_address, ABI):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(pool_address)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.getReserves().call()

def getBalanceOfToken(pool_address, owner_address, rpc_address, ABI):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(pool_address)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.balanceOf(owner_address).call()

def getPairPrice0CumulativeLast(pool_address, rpc_address, ABI):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(pool_address)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.price0CumulativeLast().call()

def getPairPrice1CumulativeLast(pool_address, rpc_address, ABI):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(pool_address)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.price1CumulativeLast().call()

class UniswapV2Pair:
    def __init__(self, pair_address, rpc_address, abi, logger):
        self.address = pair_address
        self.abi = abi
        self.rpc_address = rpc_address
        self.logger = logger

        self.symbol_value = None
        self.token_0_value = None
        self.token_1_value = None

    def symbol(self):
        if self.symbol_value is None:
            self.symbol_value = getPairSymbol(self.address, self.rpc_address)
        return self.symbol_value

    def token_0(self):
        if self.token_0_value is None:
            self.token_0_value = getPairToken0(self.address, self.rpc_address)
        return self.token_0_value

    def token_1(self):
        if self.token_1_value is None:
            self.token_1_value = getPairToken1(self.address, self.rpc_address)
        return self.token_1_value

    def decimals(self):
        return getPairDecimals(self.address, self.rpc_address, self.abi)

    def total_supply(self):
        return getPairTotalSupply(self.address, self.rpc_address, self.abi)

    def reserves(self):
        return getPairReserves(self.address, self.rpc_address, self.abi)

    def getBalanceOfToken(self, address):
        return getBalanceOfToken(self.address, address, self.rpc_address, self.abi)

    def price_0_cumulative_last(self):
        return getPairPrice0CumulativeLast(self.address, self.rpc_address, self.abi)

    def price_1_cumulative_last(self):
        return getPairPrice1CumulativeLast(self.address, self.rpc_address, self.abi)