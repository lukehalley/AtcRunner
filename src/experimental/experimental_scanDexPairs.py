from src.chain.contract.contract_ERC20 import getTokenSymbol
from src.chain.contract.contract_Factory import allPairs, allPairsLength
from src.utils.chain.chain_ABI import fillEmptyABIParams

# DFK Chain RPC
rpc = 'https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc'

# DFK Dex Factory + ABI
addy = '0x794C07912474351b3134E6D6B3B7b3b4A07cbAAa'
factoryAbi = [{'anonymous': False,
        'inputs': [{'indexed': True,
                    'internalType': 'address',
                    'name': 'token0',
                    'type': 'address'},
                   {'indexed': True,
                    'internalType': 'address',
                    'name': 'token1',
                    'type': 'address'},
                   {'indexed': False,
                    'internalType': 'address',
                    'name': 'pair',
                    'type': 'address'},
                   {'indexed': False,
                    'internalType': 'uint256',
                    'name': '',
                    'type': 'uint256'}],
        'name': 'PairCreated',
        'type': 'event'},
       {'constant': True,
        'inputs': [{'internalType': 'uint256', 'name': '', 'type': 'uint256'}],
        'name': 'allPairs',
        'outputs': [{'internalType': 'address', 'name': 'pair', 'type': 'address'}],
        'payable': False,
        'stateMutability': 'view',
        'type': 'function'},
       {'constant': True,
        'name': 'allPairsLength',
        'outputs': [{'internalType': 'uint256', 'name': '', 'type': 'uint256'}],
        'payable': False,
        'stateMutability': 'view',
        'type': 'function',
        'inputs': []},
       {'constant': False,
        'inputs': [{'internalType': 'address', 'name': 'tokenA', 'type': 'address'},
                   {'internalType': 'address', 'name': 'tokenB', 'type': 'address'}],
        'name': 'createPair',
        'outputs': [{'internalType': 'address', 'name': 'pair', 'type': 'address'}],
        'payable': False,
        'stateMutability': 'nonpayable',
        'type': 'function'},
       {'constant': True,
        'name': 'feeTo',
        'outputs': [{'internalType': 'address', 'name': '', 'type': 'address'}],
        'payable': False,
        'stateMutability': 'view',
        'type': 'function'},
       {'constant': True,
        'name': 'feeToSetter',
        'outputs': [{'internalType': 'address', 'name': '', 'type': 'address'}],
        'payable': False,
        'stateMutability': 'view',
        'type': 'function'},
       {'constant': True,
        'inputs': [{'internalType': 'address', 'name': 'tokenA', 'type': 'address'},
                   {'internalType': 'address', 'name': 'tokenB', 'type': 'address'}],
        'name': 'getPair',
        'outputs': [{'internalType': 'address', 'name': 'pair', 'type': 'address'}],
        'payable': False,
        'stateMutability': 'view',
        'type': 'function'},
       {'constant': False,
        'inputs': [{'internalType': 'address', 'name': '', 'type': 'address'}],
        'name': 'setFeeTo',
        'payable': False,
        'stateMutability': 'nonpayable',
        'type': 'function'},
       {'constant': False,
        'inputs': [{'internalType': 'address', 'name': '', 'type': 'address'}],
        'name': 'setFeeToSetter',
        'payable': False,
        'stateMutability': 'nonpayable',
        'type': 'function'}]
wethAbi = [
    {
        "anonymous": False,
        "inputs": [
            {
                "indexed": True,
                "internalType": "address",
                "name": "src",
                "type": "address"
            },
            {
                "indexed": True,
                "internalType": "address",
                "name": "guy",
                "type": "address"
            },
            {
                "indexed": False,
                "internalType": "uint256",
                "name": "wad",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {
                "indexed": True,
                "internalType": "address",
                "name": "dst",
                "type": "address"
            },
            {
                "indexed": False,
                "internalType": "uint256",
                "name": "wad",
                "type": "uint256"
            }
        ],
        "name": "Deposit",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {
                "indexed": True,
                "internalType": "address",
                "name": "src",
                "type": "address"
            },
            {
                "indexed": True,
                "internalType": "address",
                "name": "dst",
                "type": "address"
            },
            {
                "indexed": False,
                "internalType": "uint256",
                "name": "wad",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {
                "indexed": True,
                "internalType": "address",
                "name": "src",
                "type": "address"
            },
            {
                "indexed": False,
                "internalType": "uint256",
                "name": "wad",
                "type": "uint256"
            }
        ],
        "name": "Withdrawal",
        "type": "event"
    },
    {
        "payable": True,
        "stateMutability": "payable",
        "type": "fallback"
    },
    {
        "constant": True,
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": False,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": False,
        "inputs": [
            {
                "internalType": "address",
                "name": "guy",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "wad",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "payable": False,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": True,
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": False,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": True,
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "payable": False,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": False,
        "name": "deposit",
        "payable": True,
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "constant": True,
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "payable": False,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": True,
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "payable": False,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": True,
        "name": "totalSupply",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": False,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": False,
        "inputs": [
            {
                "internalType": "address",
                "name": "dst",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "wad",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "payable": False,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": False,
        "inputs": [
            {
                "internalType": "address",
                "name": "src",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "dst",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "wad",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "payable": False,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": False,
        "inputs": [
            {
                "internalType": "uint256",
                "name": "wad",
                "type": "uint256"
            }
        ],
        "name": "withdraw",
        "payable": False,
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

factoryAbiCleaned = fillEmptyABIParams(abi=factoryAbi, contractFunctionName="allPairsLength")
wethAbiCleaned = fillEmptyABIParams(abi=wethAbi, contractFunctionName="symbol")

len = allPairsLength(rpc_address=rpc, factoryAddress=addy, factoryABI=factoryAbiCleaned)

for number in range(0, len):
    res = allPairs(index=number, rpc_address=rpc, factoryAddress=addy, factoryABI=factoryAbiCleaned)
    symbol = getTokenSymbol(token_address=res, rpc_address=rpc, wethContractABI=wethAbi)
    print(f"{number}: {res} | {symbol}")

