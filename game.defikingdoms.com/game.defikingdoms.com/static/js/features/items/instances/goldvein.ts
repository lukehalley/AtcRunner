import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import goldveinImage from '../images/goldvein.png'
import { ItemKeys, ItemType } from '../types'

export const goldvein = new Item({
  key: ItemKeys.GOLDVEIN,
  name: 'Goldvein',
  description: 'Brings a whole new level to variegated leaves. Quite valuable.',
  image: goldveinImage,
  type: ItemType.SCRAP,

  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x600541aD6Ce0a8b5dae68f086D46361534D20E80',
    [ChainId.HARMONY_TESTNET]: '0xCDDbE7Aeb5a87C5b815abDf07e25D0aA024C9E68'
  },
  tokenSymbol: 'DFKGLDVN',
  salesPrice: 100,
  featuredMetric: true
})
