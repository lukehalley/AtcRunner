import { ChainId } from 'constants/sdk-extra'
import { Request } from './types'

export const REQUEST: Request = {
  leaderboard: {
    [ChainId.HARMONY_MAINNET]: 'https://us-central1-defi-kingdoms-api.cloudfunctions.net/leaderboard',
    [ChainId.HARMONY_TESTNET]: 'https://us-central1-dfktest-1d7ce.cloudfunctions.net/leaderboard',
    [ChainId.MAINNET]: '',
    [ChainId.ROPSTEN]: '',
    [ChainId.RINKEBY]: '',
    [ChainId.GÖRLI]: '',
    [ChainId.KOVAN]: '',
    [ChainId.BSC_MAINNET]: '',
    [ChainId.BSC_TESTNET]: '',
    [ChainId.AVALANCHE_C_CHAIN]: '',
    [ChainId.AVALANCE_FUJI_TESTNET]: '',
    [ChainId.DFK_MAINNET]: '',
    [ChainId.DFK_TESTNET]: '',
    [ChainId.HARDHAT]: ''
  },
  leaderboardSelection: {
    [ChainId.HARMONY_MAINNET]: 'https://us-central1-defi-kingdoms-api.cloudfunctions.net/leaderboardSelection',
    [ChainId.HARMONY_TESTNET]: 'https://us-central1-dfktest-1d7ce.cloudfunctions.net/leaderboardSelection',
    [ChainId.MAINNET]: '',
    [ChainId.ROPSTEN]: '',
    [ChainId.RINKEBY]: '',
    [ChainId.GÖRLI]: '',
    [ChainId.KOVAN]: '',
    [ChainId.BSC_MAINNET]: '',
    [ChainId.BSC_TESTNET]: '',
    [ChainId.AVALANCHE_C_CHAIN]: '',
    [ChainId.AVALANCE_FUJI_TESTNET]: '',
    [ChainId.DFK_MAINNET]: '',
    [ChainId.DFK_TESTNET]: '',
    [ChainId.HARDHAT]: ''
  }
}

export const timePeriodValues = [
  {
    label: 'Today',
    value: 'D'
  },
  {
    label: 'This week',
    value: 'W'
  },
  {
    label: 'This month',
    value: 'M'
  }
]
