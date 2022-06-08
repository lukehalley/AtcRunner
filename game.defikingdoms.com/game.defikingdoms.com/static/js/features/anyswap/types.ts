import { BigNumber } from 'ethers'
import { NETWORKS } from './constants'

export interface Token {
  address: string
  chainId: number
  decimals: number
  name: string
  symbol: string
}

export interface Network {
  tokenListUrl: string
  tokenList: {
    keywords: string[]
    logoURI: string
    name: string
    timestamp: string
    tokens: Token[]
    version: { major: number; minor: number; patch: 1 }
  }
  bridgeInitToken: string
  bridgeInitChain: string
  nativeToken: string
  crossBridgeInitToken: string
  swapRouterToken: string
  swapInitToken: string
  multicalToken: string
  v1FactoryToken: string
  v2FactoryToken: string
  timelock: string
  nodeRpc: string
  nodeRpcList?: string[]
  chainId: number
  lookHash: string
  lookAddr: string
  lookBlock: string
  explorer: string
  symbol: string
  name: string
  networkName: string
  type: string
  label: number
  isSwitch: 1
  suffix: string
  anyToken: string
}

export interface AnyToken {
  address: string
  name: string
  symbol: string
  decimals: number
}

export interface CommonTokenChain {
  address: string
  underlying?: AnyToken
  anyToken: AnyToken
}

export interface DestChain extends CommonTokenChain {
  swapfeeon: number
  MaximumSwap: string
  MinimumSwap: string
  BigValueThreshold: string
  SwapFeeRatePerMillion: number
  MaximumSwapFee: string
  MinimumSwapFee: string
}

export interface TokenResponse extends CommonTokenChain {
  destChains: { [k: string]: DestChain }
  price: number
  logoUrl: string
  chainId: string
  tokenid: string
  version: string
  router: string
}

export interface HandleSwapPayload {
  router: string
  tokenAddress: string
  toAddress: string
  amount: string
  toChainID: string
  isUnderlying: boolean
  addTransaction: Function
  setTransactionProcessing: Function
}

export interface PollData {
  msg: 'Error' | 'Success'
  info: {
    status: TransactionStatus
  }
}

export enum TransactionStatus {
  ExceedLimit = 3,
  Confirming = 8,
  Swapping = 9,
  Success = 10,
  BigAmount = 12,
  Failure = 14
}

export interface NetworkPayload {
  chainId: BigNumber
  rpcUrls: string[]
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  blockExplorerUrls: string[]
}

export type SupportedChain = keyof typeof NETWORKS
export type TokenMap = { [index: string]: TokenResponse }
export type NetworkTokenMap = { [chain: string]: TokenMap }
