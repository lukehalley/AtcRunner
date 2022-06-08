import { BigNumber } from '@ethersproject/bignumber'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { ChainId, JSBI, Percent, Token, WETH } from 'constants/sdk-extra'
import { injected } from '../connectors'
import getTokenWithDefault from '../utils/getTokenWithDefault'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const ZERO_ONE_ADDRESS = '0x0000000000000000000000000000000000000001'

export const ROUTER_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: '0x3C351E1afdd1b1BC44e931E12D4E05D6125eaeCa',
  [ChainId.DFK_TESTNET]: '0x7dEfa830CE7E3Ec374B2cE07EabeD6FBB48a1c09',
  [ChainId.HARMONY_MAINNET]: '0x24ad62502d1C652Cc7684081169D04896aC20f30',
  [ChainId.HARMONY_TESTNET]: '0xa755d4728B74ae0D76ecA76d0a36D4Ffc1544122',
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARDHAT]: '0x72Cb10C6bfA5624dD07Ef608027E366bd690048F'
}

export const PROFILES_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARMONY_MAINNET]: '0x6391F796D56201D279a42fD3141aDa7e26A3B4A5',
  [ChainId.HARMONY_TESTNET]: '0x729Fcb5f7C17Def718BC2D96b779742e1818fd06',
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARDHAT]: '0x9d2d565A47Ceb87313208c420A40De4522291744'
}

export const STYLIST_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARMONY_MAINNET]: '0x8f1CeD3ABa6893E65DE59452C466B2CBb7Cd690b',
  [ChainId.HARMONY_TESTNET]: '0x703cadA8b820A0C7e22B424DAd7B2937A7afFD68',
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
}

export const GOVERNANCE_ADDRESS = ZERO_ONE_ADDRESS

export const TIMELOCK_ADDRESS = ZERO_ONE_ADDRESS

export const GOVERNANCE_TOKEN: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, ZERO_ONE_ADDRESS, 18, 'JEWEL', 'Jewels'),
  [ChainId.RINKEBY]: new Token(ChainId.RINKEBY, ZERO_ONE_ADDRESS, 18, 'JEWEL', 'Jewels'),
  [ChainId.ROPSTEN]: new Token(ChainId.ROPSTEN, ZERO_ONE_ADDRESS, 18, 'JEWEL', 'Jewels'),
  [ChainId.GÖRLI]: new Token(ChainId.GÖRLI, ZERO_ONE_ADDRESS, 18, 'JEWEL', 'Jewels'),
  [ChainId.KOVAN]: new Token(ChainId.KOVAN, ZERO_ONE_ADDRESS, 18, 'JEWEL', 'Jewels'),
  [ChainId.BSC_MAINNET]: new Token(ChainId.BSC_MAINNET, ZERO_ONE_ADDRESS, 18, 'JEWEL', 'Jewels'),
  [ChainId.BSC_TESTNET]: new Token(ChainId.BSC_TESTNET, ZERO_ONE_ADDRESS, 18, 'JEWEL', 'Jewels'),
  [ChainId.DFK_MAINNET]: new Token(
    ChainId.DFK_MAINNET,
    '0x04b9dA42306B023f3572e106B11D82aAd9D32EBb',
    18,
    'CRYSTAL',
    'Crystal'
  ),
  [ChainId.DFK_TESTNET]: new Token(
    ChainId.DFK_TESTNET,
    '0xa5c47B4bEb35215fB0CF0Ea6516F9921591c3aCE',
    18,
    'CRYSTAL',
    'Crystal'
  ),
  [ChainId.HARMONY_MAINNET]: new Token(
    ChainId.HARMONY_MAINNET,
    '0x72Cb10C6bfA5624dD07Ef608027E366bd690048F',
    18,
    'JEWEL',
    'Jewels'
  ),
  [ChainId.HARMONY_TESTNET]: new Token(
    ChainId.HARMONY_TESTNET,
    '0x63882d0438AdA0dD76ed2E6B7C2D53A55284A557',
    18,
    'JEWEL',
    'Jewels'
  ),
  [ChainId.AVALANCHE_C_CHAIN]: new Token(
    ChainId.HARMONY_MAINNET,
    '0x72Cb10C6bfA5624dD07Ef608027E366bd690048F',
    18,
    'JEWEL',
    'Jewels'
  ),
  [ChainId.AVALANCE_FUJI_TESTNET]: new Token(
    ChainId.HARMONY_TESTNET,
    '0x63882d0438AdA0dD76ed2E6B7C2D53A55284A557',
    18,
    'JEWEL',
    'Jewels'
  ),
  [ChainId.HARDHAT]: new Token(ChainId.HARDHAT, '0xF34D3Cd4BB06b81D28f15068Bb8Dd0e078B7a6f7', 18, 'JEWEL', 'Jewels')
}

export const MASTER_GARDENER: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: '0x57Dec9cC7f492d6583c773e2E7ad66dcDc6940Fb',
  [ChainId.DFK_TESTNET]: '0xF8eDA301Fe64103DAa18a810527F77Cff674fe14',
  [ChainId.HARMONY_MAINNET]: '0xDB30643c71aC9e2122cA0341ED77d09D5f99F924',
  [ChainId.HARMONY_TESTNET]: '0x889aB3A26FEFFC204c9c566923D2aBED2236E661',
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARDHAT]: '0xBbd7c4Be2e54fF5e013471162e1ABAD7AB74c3C3'
}

export const BANKER: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: '0x4b1F4C7981465F814c4A78d79be21558A60f57F2',
  [ChainId.DFK_TESTNET]: '0x14b54Bf631c5147a1a59920f89128bE6A5FCe602',
  [ChainId.HARMONY_MAINNET]: '0x3685Ec75Ea531424Bbe67dB11e07013ABeB95f1e',
  [ChainId.HARMONY_TESTNET]: '0xC617C69089a7f41C4030aC94Cf06dA2722D7ea12',
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARDHAT]: '0x5e9Fc8F08B4CEF42F63A893c981dB67a85bBDA62'
}

export const BANK: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, ZERO_ONE_ADDRESS, 18, 'xJEWEL', 'xJEWEL Shares'),
  [ChainId.RINKEBY]: new Token(ChainId.RINKEBY, ZERO_ONE_ADDRESS, 18, 'xJEWEL', 'xJEWEL Shares'),
  [ChainId.ROPSTEN]: new Token(ChainId.ROPSTEN, ZERO_ONE_ADDRESS, 18, 'xJEWEL', 'xJEWEL Shares'),
  [ChainId.GÖRLI]: new Token(ChainId.GÖRLI, ZERO_ONE_ADDRESS, 18, 'xJEWEL', 'xJEWEL Shares'),
  [ChainId.KOVAN]: new Token(ChainId.KOVAN, ZERO_ONE_ADDRESS, 18, 'xJEWEL', 'xJEWEL Shares'),
  [ChainId.BSC_MAINNET]: new Token(ChainId.BSC_MAINNET, ZERO_ONE_ADDRESS, 18, 'xJEWEL', 'xJEWEL Shares'),
  [ChainId.BSC_TESTNET]: new Token(ChainId.BSC_TESTNET, ZERO_ONE_ADDRESS, 18, 'xJEWEL', 'xJEWEL Shares'),
  [ChainId.DFK_MAINNET]: new Token(
    ChainId.DFK_MAINNET,
    '0x6E7185872BCDf3F7a6cBbE81356e50DAFFB002d2',
    18,
    'xCRYSTAL',
    'xCRYSTAL Shares'
  ),
  [ChainId.DFK_TESTNET]: new Token(
    ChainId.DFK_TESTNET,
    '0x1A516207ABe4A0A636C6bB1C083c9EB46a026131',
    18,
    'xCRYSTAL',
    'xCRYSTAL Shares'
  ),
  [ChainId.HARMONY_MAINNET]: new Token(
    ChainId.HARMONY_MAINNET,
    '0xA9cE83507D872C5e1273E745aBcfDa849DAA654F',
    18,
    'xJEWEL',
    'xJEWEL Shares'
  ),
  [ChainId.HARMONY_TESTNET]: new Token(
    ChainId.HARMONY_TESTNET,
    '0x9bBD946ED9b6e9EA4FD85f3Fa9ADB9CC6f03c2BE',
    18,
    'xJEWEL',
    'xJEWEL Shares'
  ),
  [ChainId.AVALANCHE_C_CHAIN]: new Token(
    ChainId.HARMONY_MAINNET,
    '0xA9cE83507D872C5e1273E745aBcfDa849DAA654F',
    18,
    'xJEWEL',
    'xJEWEL Shares'
  ),
  [ChainId.AVALANCE_FUJI_TESTNET]: new Token(
    ChainId.HARMONY_MAINNET,
    '0x9bBD946ED9b6e9EA4FD85f3Fa9ADB9CC6f03c2BE',
    18,
    'xJEWEL',
    'xJEWEL Shares'
  ),
  [ChainId.HARDHAT]: new Token(
    ChainId.HARDHAT,
    '0x9d05F8289F0eA7D1993B316F45b8e6E29F7e5D16',
    18,
    'xJEWEL',
    'xJEWEL Shares'
  )
}

export const BANK_SETTINGS: { [chainId in ChainId]: Record<string, string> } = {
  [ChainId.MAINNET]: { name: '', path: '' },
  [ChainId.RINKEBY]: { name: '', path: '' },
  [ChainId.ROPSTEN]: { name: '', path: '' },
  [ChainId.GÖRLI]: { name: '', path: '' },
  [ChainId.KOVAN]: { name: '', path: '' },
  [ChainId.BSC_MAINNET]: { name: '', path: '' },
  [ChainId.BSC_TESTNET]: { name: '', path: '' },
  [ChainId.DFK_MAINNET]: { name: 'Jeweler', path: '/jeweler' },
  [ChainId.DFK_TESTNET]: { name: 'Jeweler', path: '/jeweler' },
  [ChainId.HARMONY_MAINNET]: { name: 'Jeweler', path: '/jeweler' },
  [ChainId.HARMONY_TESTNET]: { name: 'Jeweler', path: '/jeweler' },
  [ChainId.AVALANCHE_C_CHAIN]: { name: '', path: '' },
  [ChainId.AVALANCE_FUJI_TESTNET]: { name: '', path: '' },
  [ChainId.HARDHAT]: { name: 'Jeweler', path: '/jeweler' }
}

export const WEB_INTERFACES: { [chainId in ChainId]: string[] } = {
  [ChainId.MAINNET]: [''],
  [ChainId.RINKEBY]: [''],
  [ChainId.ROPSTEN]: [''],
  [ChainId.GÖRLI]: [''],
  [ChainId.KOVAN]: [''],
  [ChainId.BSC_MAINNET]: [''],
  [ChainId.BSC_TESTNET]: [''],
  [ChainId.DFK_MAINNET]: ['defikingdoms.com'],
  [ChainId.DFK_TESTNET]: ['defikingdoms.com'],
  [ChainId.HARMONY_MAINNET]: ['defikingdoms.com'],
  [ChainId.HARMONY_TESTNET]: ['defikingdoms.com'],
  [ChainId.AVALANCHE_C_CHAIN]: ['defikingdoms.com'],
  [ChainId.AVALANCE_FUJI_TESTNET]: ['defikingdoms.com'],
  [ChainId.HARDHAT]: ['defikingdoms.com']
}

export { PRELOADED_PROPOSALS } from './proposals'

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
}

export const DAI = new Token(ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin')
export const USDC = new Token(ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD//C')
export const USDT = new Token(ChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD')
export const COMP = new Token(ChainId.MAINNET, '0xc00e94Cb662C3520282E6f5717214004A7f26888', 18, 'COMP', 'Compound')
export const MKR = new Token(ChainId.MAINNET, '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', 18, 'MKR', 'Maker')
export const AMPL = new Token(ChainId.MAINNET, '0xD46bA6D942050d489DBd938a2C909A5d5039A161', 9, 'AMPL', 'Ampleforth')
export const WBTC = new Token(ChainId.MAINNET, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 8, 'WBTC', 'Wrapped BTC')

// Block time here is slightly higher (~1s) than average in order to avoid ongoing proposals past the displayed time
export const AVERAGE_BLOCK_TIME_IN_SECS = 13
export const PROPOSAL_LENGTH_IN_BLOCKS = 40_320
export const PROPOSAL_LENGTH_IN_SECS = AVERAGE_BLOCK_TIME_IN_SECS * PROPOSAL_LENGTH_IN_BLOCKS

export const COMMON_CONTRACT_NAMES: { [address: string]: string } = {
  [GOVERNANCE_ADDRESS]: 'Governance',
  [TIMELOCK_ADDRESS]: 'Timelock'
}

export const FALLBACK_GAS_LIMIT = BigNumber.from(6721900)

// TODO: specify merkle distributor for mainnet
export const MERKLE_DISTRIBUTOR_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.MAINNET]: '0x090D4613473dEE047c3f2706764f49E0821D256e'
}

const WETH_ONLY: ChainTokenList = {
  [ChainId.MAINNET]: [WETH[ChainId.MAINNET]],
  [ChainId.ROPSTEN]: [WETH[ChainId.ROPSTEN]],
  [ChainId.RINKEBY]: [WETH[ChainId.RINKEBY]],
  [ChainId.GÖRLI]: [WETH[ChainId.GÖRLI]],
  [ChainId.KOVAN]: [WETH[ChainId.KOVAN]],
  [ChainId.BSC_MAINNET]: [WETH[ChainId.BSC_MAINNET]],
  [ChainId.BSC_TESTNET]: [WETH[ChainId.BSC_TESTNET]],
  [ChainId.DFK_MAINNET]: [WETH[ChainId.DFK_MAINNET]],
  [ChainId.DFK_TESTNET]: [WETH[ChainId.DFK_TESTNET]],
  [ChainId.HARMONY_MAINNET]: [WETH[ChainId.HARMONY_MAINNET]],
  [ChainId.HARMONY_TESTNET]: [WETH[ChainId.HARMONY_TESTNET]],
  [ChainId.AVALANCHE_C_CHAIN]: [WETH[ChainId.AVALANCHE_C_CHAIN]],
  [ChainId.AVALANCE_FUJI_TESTNET]: [WETH[ChainId.AVALANCE_FUJI_TESTNET]],
  [ChainId.HARDHAT]: [WETH[ChainId.HARDHAT]]
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], DAI, USDC, USDT, COMP, MKR, WBTC],
  [ChainId.DFK_MAINNET]: [
    ...WETH_ONLY[ChainId.DFK_MAINNET],
    getTokenWithDefault(ChainId.DFK_MAINNET, 'xJEWEL'),
    getTokenWithDefault(ChainId.DFK_MAINNET, 'CRYSTAL'),
    getTokenWithDefault(ChainId.DFK_MAINNET, 'USDC')
  ],
  [ChainId.DFK_TESTNET]: [
    ...WETH_ONLY[ChainId.DFK_TESTNET],
    getTokenWithDefault(ChainId.DFK_TESTNET, 'xJEWEL'),
    getTokenWithDefault(ChainId.DFK_TESTNET, 'CRYSTAL')
  ],
  [ChainId.HARMONY_MAINNET]: [
    ...WETH_ONLY[ChainId.HARMONY_MAINNET],
    getTokenWithDefault(ChainId.HARMONY_MAINNET, 'BUSD'),
    getTokenWithDefault(ChainId.HARMONY_MAINNET, 'bscBUSD'),
    getTokenWithDefault(ChainId.HARMONY_MAINNET, '1USDC'),
    getTokenWithDefault(ChainId.HARMONY_MAINNET, 'JEWEL'),
    getTokenWithDefault(ChainId.HARMONY_MAINNET, '1ETH'),
    getTokenWithDefault(ChainId.HARMONY_MAINNET, 'LINK'),
    getTokenWithDefault(ChainId.HARMONY_MAINNET, 'MIS')
  ]
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.MAINNET]: {
    [AMPL.address]: [DAI, WETH[ChainId.MAINNET]]
  }
}

// used for display in the default list when adding liquidity -- COMMON BASES LIST
export const SUGGESTED_BASES: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], DAI, USDC, USDT, WBTC],
  [ChainId.DFK_MAINNET]: [
    ...WETH_ONLY[ChainId.DFK_MAINNET],
    getTokenWithDefault(ChainId.DFK_MAINNET, 'xJEWEL'),
    getTokenWithDefault(ChainId.DFK_MAINNET, 'CRYSTAL')
  ],
  [ChainId.DFK_TESTNET]: [
    ...WETH_ONLY[ChainId.DFK_TESTNET],
    getTokenWithDefault(ChainId.DFK_TESTNET, 'xJEWEL'),
    getTokenWithDefault(ChainId.DFK_TESTNET, 'CRYSTAL')
  ],
  [ChainId.HARMONY_MAINNET]: [
    ...WETH_ONLY[ChainId.HARMONY_MAINNET],
    getTokenWithDefault(ChainId.HARMONY_MAINNET, 'BUSD'),
    getTokenWithDefault(ChainId.HARMONY_MAINNET, 'JEWEL'),
    getTokenWithDefault(ChainId.HARMONY_MAINNET, '1USDC'),
    getTokenWithDefault(ChainId.HARMONY_MAINNET, '1WBTC'),
    getTokenWithDefault(ChainId.HARMONY_MAINNET, '1ETH')
  ]
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], DAI, USDC, USDT, WBTC],
  [ChainId.DFK_MAINNET]: [
    ...WETH_ONLY[ChainId.DFK_MAINNET],
    getTokenWithDefault(ChainId.DFK_MAINNET, 'xJEWEL'),
    getTokenWithDefault(ChainId.DFK_MAINNET, 'CRYSTAL')
  ],
  [ChainId.DFK_TESTNET]: [
    ...WETH_ONLY[ChainId.DFK_TESTNET],
    getTokenWithDefault(ChainId.DFK_TESTNET, 'xJEWEL'),
    getTokenWithDefault(ChainId.DFK_TESTNET, 'CRYSTAL')
  ],
  [ChainId.HARMONY_MAINNET]: [
    ...WETH_ONLY[ChainId.HARMONY_MAINNET],
    getTokenWithDefault(ChainId.HARMONY_MAINNET, 'BUSD'),
    getTokenWithDefault(ChainId.HARMONY_MAINNET, 'bscBUSD'),
    getTokenWithDefault(ChainId.HARMONY_MAINNET, '1USDC'),
    getTokenWithDefault(ChainId.HARMONY_MAINNET, 'JEWEL'),
    getTokenWithDefault(ChainId.HARMONY_MAINNET, '1ETH'),
    getTokenWithDefault(ChainId.HARMONY_MAINNET, 'LINK')
  ]
}

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {
  [ChainId.MAINNET]: [
    [
      new Token(ChainId.MAINNET, '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', 8, 'cDAI', 'Compound Dai'),
      new Token(ChainId.MAINNET, '0x39AA39c021dfbaE8faC545936693aC917d5E7563', 8, 'cUSDC', 'Compound USD Coin')
    ],
    [USDC, USDT],
    [DAI, USDT]
  ]
}

export interface WalletInfo {
  connector?: AbstractConnector
  name: string
  iconName: string
  description: string
  href: string | null
  color: string
  primary?: true
  mobile?: true
  mobileOnly?: true
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    iconName: 'metamask.png',
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D'
  }
}

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

// used for rewards deadlines
export const BIG_INT_SECONDS_IN_WEEK = JSBI.BigInt(60 * 60 * 24 * 7)

export const BIG_INT_ZERO = JSBI.BigInt(0)

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%

// used to ensure the user doesn't send so much gas token that they end up with < 1
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18)) // 1 gas token
export const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(JSBI.BigInt(50), JSBI.BigInt(10000))

export const ZERO_PERCENT = new Percent('0')
export const ONE_HUNDRED_PERCENT = new Percent('1')

// SDN OFAC addresses
export const BLOCKED_ADDRESSES: string[] = [
  '0x7F367cC41522cE07553e823bf3be79A889DEbe1B',
  '0xd882cFc20F52f2599D84b8e8D58C7FB62cfE344b',
  '0x901bb9583b24D97e995513C6778dc6888AB6870e',
  '0xA7e5d5A720f06526557c513402f2e6B5fA20b008',
  '0x8576aCC5C05D6Ce88f4e49bf65BdF0C62F91353C'
]

export const CRYSTALCORE_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: '0x68f6C64786cfCb35108986041D1009c9d27bde22',
  [ChainId.DFK_TESTNET]: '0x51aacFeA9be0d10032aC66dF69F72Cc78730b162',
  [ChainId.HARMONY_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARMONY_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
}

export const HEROCORE_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: '0xEb9B61B145D6489Be575D3603F4a704810e143dF',
  [ChainId.DFK_TESTNET]: '0x3bcaCBeAFefed260d877dbE36378008D4e714c8E',
  [ChainId.HARMONY_MAINNET]: '0x5F753dcDf9b1AD9AabC1346614D1f4746fd6Ce5C',
  [ChainId.HARMONY_TESTNET]: '0xC57971c3EC0Fc2450FC5CC9c4398ac08ff09e6ED',
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
}

export const HEROSALE_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARMONY_MAINNET]: '0xdF0Bf714e80F5e6C994F16B05b7fFcbCB83b89e9',
  [ChainId.HARMONY_TESTNET]: '0x4E8b1f13A64C0B7735FA0f9f4C7e4Af38b502988',
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
}

export const GEN0AIRDROP_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARMONY_MAINNET]: '0xBd1f65e7f350C614d364AEFeB2d87F829b0E465d',
  [ChainId.HARMONY_TESTNET]: '0x5C2AeA531a09f8702a0f7BfA040c7e46a46118CC',
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
}

export const HEROSUMMONING_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: '0xBc36D18662Bb97F9e74B1EAA1B752aA7A44595A7',
  [ChainId.DFK_TESTNET]: '0x1017c852e3731FaD2e893e80C6916D71Cf0B0A0a',
  [ChainId.HARMONY_MAINNET]: '0xf4d3aE202c9Ae516f7eb1DB5afF19Bf699A5E355',
  [ChainId.HARMONY_TESTNET]: '0x1702c7f5d67C0FDE65a8f3ed1a0C02c9FE4a5b99',
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
}

export const ASSISTINGAUCTION_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: '0x8101CfFBec8E045c3FAdC3877a1D30f97d301209',
  [ChainId.DFK_TESTNET]: '0x846635615609a8dd88eA4A92dA1F1Ba6880a9Eb5',
  [ChainId.HARMONY_MAINNET]: '0x65DEA93f7b886c33A78c10343267DD39727778c2',
  [ChainId.HARMONY_TESTNET]: '0x5f5a567140A4b7A0406f568B152aA4bc3aCda8Ed',
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
}

export const ASSISTINGAUCTION_OLD_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARMONY_MAINNET]: '0x65DEA93f7b886c33A78c10343267DD39727778c2',
  [ChainId.HARMONY_TESTNET]: '0x5f5a567140A4b7A0406f568B152aA4bc3aCda8Ed',
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
}

export const SALEAUCTION_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: '0xc390fAA4C7f66E4D62E59C231D5beD32Ff77BEf0',
  [ChainId.DFK_TESTNET]: '0xb9b4C20165a421E7208494A38a37679c7F334770',
  [ChainId.HARMONY_MAINNET]: '0x13a65B9F8039E2c032Bc022171Dc05B30c3f2892',
  [ChainId.HARMONY_TESTNET]: '0xC839907F3341540C29F1F583e65A111847cc9203',
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
}

export const GOLD_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARMONY_MAINNET]: '0x3a4EDcf3312f44EF027acfd8c21382a5259936e7',
  [ChainId.HARMONY_TESTNET]: '0x24B46b91E0862221D39dd30FAAd63999717860Ab',
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
}

export const ITEMGOLDTRADER_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARMONY_MAINNET]: '0xe53BF78F8b99B6d356F93F41aFB9951168cca2c6',
  [ChainId.HARMONY_TESTNET]: '0x65D232da83d69A76189dA008Eb03BCFB211A1612',
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
}

export const ALCHEMIST_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARMONY_MAINNET]: '0x87CBa8F998F902f2fff990efFa1E261F35932e57',
  [ChainId.HARMONY_TESTNET]: '0x638C716b5aF694Cee4B0639826EAEbaAD03C2f66',
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
}

export const STONE_CARVER_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARMONY_MAINNET]: '0xfFB8a55676edA75954AB45a6Ce16F88b119dC511',
  [ChainId.HARMONY_TESTNET]: '0xeAe7c8121eF9626362369b398B9F0Ee5E05fDA72',
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
}

export const ITEM_CONSUMER_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARMONY_MAINNET]: '0x38e76972BD173901B5E5E43BA5cB464293B80C31',
  [ChainId.HARMONY_TESTNET]: '0x65A7560d2D3ecD3DA4Fc42cBd11A762F10b1036c',
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
}

export const XCRYSTAL_DISBURSE_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: '0x123165B3a30fdA3655B30cfC10135C1CA3C21bFC',
  [ChainId.DFK_TESTNET]: '0x2173A8153B4b88735A6E77E910e86cdB122BDd18',
  [ChainId.HARMONY_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARMONY_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
}

export const HERO_BRIDGING_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: '0x739B1666c2956f601f095298132773074c3E184b',
  [ChainId.DFK_TESTNET]: '0xE7a90d1E7638A977fC8892896D81596E1694f3CF',
  [ChainId.HARMONY_MAINNET]: '0x573e407Be90a50EAbA28748cbb62Ff9d6038A3e9',
  [ChainId.HARMONY_TESTNET]: '0xe21a31315ddeA8200d73945AA06ACBb15DB92bFb',
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
}

export const TEARS_BRIDGING_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: '0x6a00Dc976a7291a1E9F5380FE6F96fE006dCdD3c',
  [ChainId.DFK_TESTNET]: '0xB68281c60352529595c9ed7E845262f608985D7c',
  [ChainId.HARMONY_MAINNET]: '0x27B7C0C87B9ecA92E5101852709e63685bF9d299',
  [ChainId.HARMONY_TESTNET]: '0xD2666441443DAa61492FFe0F37717578714a4521',
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
}

export const HERO_BRIDGING_GAS_FEE_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: '0x93616BE16Cf1aa4A138bfCb2320875148429713c',
  [ChainId.DFK_TESTNET]: '0x9596A3C6a4B2597adCC5D6d69b281A7C49e3Fe6A',
  [ChainId.HARMONY_MAINNET]: '0x889898D937CD5e4502Ea6E600578B8650E4043c0',
  [ChainId.HARMONY_TESTNET]: '0x6F4e8eBa4D337f874Ab57478AcC2Cb5BACdc19c9',
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
}
