import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import gaiasTearsImage from '../images/gaias-tear.png'
import { ItemKeys, ItemType } from '../types'

export const gaiasTears = new Item({
  key: ItemKeys.GAIASTEARS,
  name: 'Gaia’s Tears',
  description: 'A crystal that, when attuned properly, can summon heroes from faraway lands.',
  image: gaiasTearsImage,
  type: ItemType.SUMMON,
  addresses: {
    [ChainId.DFK_MAINNET]: '0x58E63A9bbb2047cd9Ba7E6bB4490C238d271c278',
    [ChainId.DFK_TESTNET]: '0x5829A860284f4c800a60ccDa4157e8dde0C32D30',
    [ChainId.HARMONY_MAINNET]: '0x24eA0D436d3c2602fbfEfBe6a16bBc304C963D04',
    [ChainId.HARMONY_TESTNET]: '0xf0e28E7c46F307954490fB1134c8D437e23D55fb'
  },
  tokenSymbol: 'DFKTEARS',
  featuredMetric: true
})
