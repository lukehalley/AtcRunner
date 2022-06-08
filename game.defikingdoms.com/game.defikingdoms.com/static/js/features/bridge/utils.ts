import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import { formatEther, parseUnits, formatUnits } from '@ethersproject/units'
import { Bridge, ChainId, Networks, supportedChainIds, Token, TokenSwap } from '@synapseprotocol/sdk'
import { ChainId as Chain } from 'constants/sdk-extra'
import { ethers } from 'ethers'
import { isHarmonyHook, isDFKChainHook } from 'utils'
import { RoundingOptions } from './types'

export function toHexStr(num: number) {
  return `0x${num.toString(16)}`
}

export function getDestinationChain(chainId: Chain) {
  return chainId === Chain.HARMONY_MAINNET
    ? Chain.DFK_MAINNET
    : chainId === Chain.HARMONY_TESTNET
    ? Chain.DFK_TESTNET
    : chainId === Chain.DFK_MAINNET
    ? Chain.HARMONY_MAINNET
    : Chain.HARMONY_TESTNET
}

export function getSigner(ethereum: any) {
  return new ethers.providers.Web3Provider(ethereum).getSigner()
}

export function valueWei(ether: BigNumberish, decimals: number): BigNumber {
  return parseUnits(BigNumber.from(ether).toString(), decimals)
}

export function valueEther(wei: BigNumberish, opts?: RoundingOptions): string {
  const PLACES = 6
  const weiVal = BigNumber.from(wei)
  let amtEther: string = formatEther(weiVal)

  opts = opts ?? { round: false, places: PLACES }
  const { round, places = PLACES } = opts

  if (round) {
    const exp = 18 - places
    const pow = BigNumber.from(10).pow(exp)
    const remainder = weiVal.mod(pow)
    amtEther = formatEther(weiVal.sub(remainder))
  }

  return amtEther
}

function fixWeiValue(wei: BigNumber, tokenDecimals: number): BigNumber {
  if (tokenDecimals === 18) {
    return wei
  }
  const TEN = BigNumber.from(10)
  const mul = TEN.pow(18).div(TEN.pow(tokenDecimals))
  return wei.mul(mul)
}

export function formatBNValue(
  t: Token,
  networkTo: Networks.Network | number,
  value: string,
  roundingPlaces = 3,
  fixWei = false
): string {
  const chainIdTo = networkTo instanceof Networks.Network ? networkTo.chainId : networkTo
  const tokenDecimals = t?.decimals(chainIdTo) as number
  const valueBn = BigNumber.from(value)
  const weiValue: BigNumber = fixWei ? fixWeiValue(valueBn, tokenDecimals) : valueBn

  // if a token has a .decimals() value of 6,
  // rounding the resultant value to 6 decimal places will
  // cause `valueEther()` to return 0.
  roundingPlaces = fixWei ? (tokenDecimals <= roundingPlaces ? roundingPlaces / 2 : roundingPlaces) : roundingPlaces
  const ether: string = valueEther(weiValue, { round: true, places: roundingPlaces })
  return `${ether} ${t.symbol}`
}

export function formatBNToString(bn: BigNumber, nativePrecison: number, decimalPlaces: number) {
  const fullPrecision = formatUnits(bn, nativePrecison)
  const decimalIdx = fullPrecision.indexOf('.')

  if (decimalPlaces === undefined || decimalIdx === -1) {
    return fullPrecision
  } else {
    // don't include decimal point if places = 0
    const rawNumber = Number(fullPrecision)

    if (rawNumber == 0) {
      return rawNumber.toFixed(1)
    } else {
      return rawNumber.toFixed(decimalPlaces) //.slice(0, num)
    }
  }
}

export function formatStringValue(
  t: Token,
  networkTo: Networks.Network | number,
  value: string,
  roundingPlaces = 3
): string {
  const chainIdTo = networkTo instanceof Networks.Network ? networkTo.chainId : networkTo
  const tokenDecimals = t?.decimals(chainIdTo) as number
  const numValue = Number(value)
  const roundingFactor = 10 ** roundingPlaces
  const roundedValue = Math.round(numValue * roundingFactor) / roundingFactor
  return `${roundedValue / 10 ** tokenDecimals} ${t.symbol}`
}

export const asError = (e: any): Error => (e instanceof Error ? e : new Error(e))

export function newBridgeInstance(chainId: number): Bridge.SynapseBridge {
  return new Bridge.SynapseBridge({ network: chainId })
}

export function getBridgeEstimate(
  args: { tokenFrom: Token; tokenTo: Token; chainIdTo: number; amountFrom: BigNumber },
  synapseBridge: Bridge.SynapseBridge
): Promise<Bridge.BridgeOutputEstimate> {
  return synapseBridge.estimateBridgeTokenOutput(args)
}

interface GetDestinationMapArgs {
  sourceChain: number
}

interface DestinationChain {
  [tokenSymbol: string]: Networks.Network
}

export function getDestinationMap({ sourceChain }: GetDestinationMapArgs): DestinationChain {
  const destNetworkTokensMap = TokenSwap.detailedTokenSwapMap()[sourceChain].reduce((acc, n) => {
    return { ...acc, [n.token.name]: n }
  }, {})
  return destNetworkTokensMap
}

interface GetDestinationChainsArgs {
  sourceChain: number
  sourceToken: Token
}

export function getDestinationChains({ sourceChain, sourceToken }: GetDestinationChainsArgs) {
  if (sourceChain && sourceToken) {
    const map = getDestinationMap({ sourceChain })[sourceToken.name]
    if (map) {
      const destNetworks = Object.keys(map)
        .filter(chainId => sourceChain !== Number(chainId) && supportedChainIds().includes(Number(chainId)))
        .map(chainId => Networks.fromChainId(Number(chainId)))
      return destNetworks
    }
  }
  return []
}

interface GetDestinationChainTokensArgs {
  sourceChain: number
  destChain: number
  sourceToken: Token
}

export function getDestinationChainTokens({
  sourceChain,
  sourceToken,
  destChain
}: GetDestinationChainTokensArgs): Token[] {
  const swapMap = TokenSwap.detailedTokenSwapMap()[sourceChain].find(({ token }) => sourceToken.isEqual(token))
  return swapMap?.[destChain] ?? []
}

export function selectDefaultNetwork(networks: Networks.Network[], sourceToken: Token, sourceChain: number) {
  let destNetwork = networks[0]

  if (isHarmonyHook(Number(sourceChain))) {
    destNetwork = networks.find(n => n.chainId === ChainId.DFK) || networks[0]
  } else if (isDFKChainHook(Number(sourceChain)) && sourceToken.symbol === 'wAVAX') {
    destNetwork = networks.find(n => n.chainId === ChainId.AVALANCHE) || networks[0]
  } else if (isDFKChainHook(Number(sourceChain))) {
    destNetwork = networks.find(n => n.chainId === ChainId.HARMONY) || networks[0]
  } else if (Number(sourceChain) === ChainId.AVALANCHE && sourceToken.symbol === 'AVAX') {
    destNetwork = networks.find(n => n.chainId === ChainId.DFK) || networks[0]
  }

  return destNetwork
}
