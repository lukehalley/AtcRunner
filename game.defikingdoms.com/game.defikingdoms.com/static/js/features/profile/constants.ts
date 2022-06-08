import { ChainId } from 'constants/sdk-extra'
import { Request } from './types'

export const REQUEST: Request = {
  profile: {
    [ChainId.HARMONY_MAINNET]: 'https://us-central1-defi-kingdoms-api.cloudfunctions.net/query_profiles',
    [ChainId.HARMONY_TESTNET]: 'https://us-central1-dfktest-1d7ce.cloudfunctions.net/query_profiles',
    [ChainId.AVALANCHE_C_CHAIN]: 'https://us-central1-defi-kingdoms-api.cloudfunctions.net/query_profiles',
    [ChainId.AVALANCE_FUJI_TESTNET]: 'https://us-central1-dfktest-1d7ce.cloudfunctions.net/query_profiles',
    [ChainId.DFK_MAINNET]: 'https://us-central1-defi-kingdoms-api.cloudfunctions.net/query_profiles',
    [ChainId.DFK_TESTNET]: 'https://us-central1-dfktest-1d7ce.cloudfunctions.net/query_profiles',
    [ChainId.MAINNET]: '',
    [ChainId.ROPSTEN]: '',
    [ChainId.RINKEBY]: '',
    [ChainId.GÖRLI]: '',
    [ChainId.KOVAN]: '',
    [ChainId.BSC_MAINNET]: '',
    [ChainId.BSC_TESTNET]: '',
    [ChainId.HARDHAT]: ''
  }
}
