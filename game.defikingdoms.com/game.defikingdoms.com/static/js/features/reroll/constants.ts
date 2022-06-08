import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { RerollChoices } from './types'

const recessiveColumns = [
  { key: 'd', label: 'D' },
  { key: 'r1', label: 'R1' },
  { key: 'r2', label: 'R2' },
  { key: 'r3', label: 'R3' }
]

export const gameColumns = [{ key: 'genes', label: 'Game Genes' }, ...recessiveColumns]
export const visualColumns = [{ key: 'genes', label: 'Visual Genes' }, ...recessiveColumns]

export const rewardsDetailsMap = {
  [RerollChoices.GAME_GENES]: {
    summonReset: 5,
    exp: 4000,
    statBonus: 'New subclass provides +1 to two most relevant stats immediately',
    bonusItems: '1 greater attunement crystal (based on subclass)',
    achievement: 'Rerolled game genes for the Crystalvale expansion'
  },
  [RerollChoices.APPEARANCE_GENES]: {
    summonReset: 8,
    exp: 2000,
    statBonus: 'None',
    bonusItems: '1 greater attunement crystal (chaos)',
    achievement: 'Rerolled appearance genes for the Crystalvale expansion'
  },
  [RerollChoices.BOTH_GENES]: {
    summonReset: 0,
    exp: 12000,
    statBonus: 'New subclass provides +2 to two most relevant stats immediately',
    bonusItems: '1 greater enhancement stone, 2 greater attunement crystals (based on new subclass)',
    achievement: 'Rerolled all genes for the Crystalvale expansion'
  }
}

export const statIndexMapping = [
  {
    name: 'strength',
    abbr: 'STR'
  },
  {
    name: 'agility',
    abbr: 'AGI'
  },
  {
    name: 'intelligence',
    abbr: 'INT'
  },
  {
    name: 'wisdom',
    abbr: 'WIS'
  },
  {
    name: 'luck',
    abbr: 'LCK'
  },
  {
    name: 'vitality',
    abbr: 'VIT'
  },
  {
    name: 'endurance',
    abbr: 'END'
  },
  {
    name: 'dexterity',
    abbr: 'DEX'
  },
  {
    name: 'HP',
    abbr: 'mp'
  },
  {
    name: 'MP',
    abbr: 'mp'
  },
  {
    name: 'stamina',
    abbr: 'stamina'
  }
]

export const GEN0_REROLL_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARMONY_MAINNET]: '0x74934378840D77E36AeF1f031D301549b4e1a225',
  [ChainId.HARMONY_TESTNET]: '0x25F67e57349AF9CcC188D8F5e1f64363c8A0973f',
  [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
}
