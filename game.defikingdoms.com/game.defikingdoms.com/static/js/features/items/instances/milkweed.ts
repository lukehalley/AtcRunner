import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import milkweedImage from '../images/milkweed.png'
import { ItemKeys, ItemType } from '../types'

export const milkweed = new Item({
  key: ItemKeys.MILKWEED,
  name: 'Milkweed',
  description: 'Pure white, like its namesake. Feeder of butterflies and provider of magic resistance.',
  image: milkweedImage,
  type: ItemType.INGREDIENT,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0xc0214b37FCD01511E6283Af5423CF24C96BB9808',
    [ChainId.HARMONY_TESTNET]: '0x17A1d68BEDd3aBE09ddB0551baF97386fDd5dbEB'
  },
  tokenSymbol: 'DFKMILKWEED',
  salesPrice: 12.5,
  featuredMetric: true
})
