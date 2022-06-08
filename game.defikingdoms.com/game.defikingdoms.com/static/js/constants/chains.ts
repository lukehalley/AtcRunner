import { supportedChainIds } from '@synapseprotocol/sdk'
import { ChainId } from './sdk-extra'

const FANTOM_MAINNET = 250
const FANTOM_TESTNET = 4002
const MOONBEAM_MAINNET = 1284

const bridgeChains = supportedChainIds()
export const realms = [ChainId.DFK_MAINNET, ChainId.DFK_TESTNET, ChainId.HARMONY_MAINNET, ChainId.HARMONY_TESTNET]
export const outposts = [ChainId.AVALANCHE_C_CHAIN, ChainId.AVALANCE_FUJI_TESTNET]
export const landingZones = [
  ChainId.MAINNET,
  ChainId.BSC_MAINNET,
  ChainId.BSC_TESTNET,
  FANTOM_MAINNET,
  FANTOM_TESTNET,
  ...bridgeChains
]
export const definedChains = [FANTOM_MAINNET, FANTOM_TESTNET, MOONBEAM_MAINNET]
