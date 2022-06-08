import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import darkweedImage from '../images/darkweed.png'
import { ItemKeys, ItemType } from '../types'

export const darkweed = new Item({
  key: ItemKeys.DARKWEED,
  name: 'Darkweed',
  description: 'A root, always found in dark places, that can deliver others from darkness.',
  image: darkweedImage,
  type: ItemType.INGREDIENT,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x68EA4640C5ce6cC0c9A1F17B7b882cB1cBEACcd7',
    [ChainId.HARMONY_TESTNET]: '0x70E1EF5418448EA3f2AfCd8D22CBC1cb53988A9a'
  },
  tokenSymbol: 'DFKDRKWD',
  salesPrice: 10,
  featuredMetric: true
})
