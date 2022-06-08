import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { StatOption } from './types'

export const LEVELING_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARMONY_MAINNET]: '0x0594D86b2923076a2316EaEA4E1Ca286dAA142C1',
  [ChainId.HARMONY_TESTNET]: '0x93E0767a1bbA95068cF91dc8fA4D8bAD79290b76',
  [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
}

export const startLevelingPrompts = [
  'As I foretold, so you have come. The Circle is prepared. Shall we begin?',
  'You arrive, as I have foreseen. The power of this place beckons you. Let us begin.',
  'Irae’s will has guided you to me. Few enter this place. Are you prepared?',
  'In this place, only the worthy find what they seek. Will you?'
]

export const activeLevelingPrompts = [
  'The fountain reflects that which you are. Sit now, and reflect on that which you might become.',
  'The fountain...always the same, yet ever-changing. As it once was, it shall never be again. Meditate on this, and grow beyond your current limitations.',
  'Tranquility is essential for growth. Gather yourself and let the experience of the past show you a new future.'
]

export const completeLevelingPrompts = [
  'Your experience has melded with the strength of the gods. Go forth, but remember this place…',
  'A new phase of your journey begins. Test your newfound strength, but return here in time…'
]

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

export const statOptions: StatOption[] = [
  {
    name: 'strength',
    abbr: 'STR'
  },
  {
    name: 'dexterity',
    abbr: 'DEX'
  },
  {
    name: 'agility',
    abbr: 'AGI'
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
  }
]
