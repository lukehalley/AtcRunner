import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import crystalImage from '../images/crystal-token.png'
import { ItemKeys, ItemType } from '../types'

export const crystal = new Item({
  key: ItemKeys.CRYSTAL,
  name: 'CRYSTAL',
  description: 'You find yourself subconsciously shaking this bag, just to hear the jingle and jangle.',
  image: crystalImage,
  type: ItemType.HIDDEN,
  addresses: {
    [ChainId.DFK_MAINNET]: '0x04b9dA42306B023f3572e106B11D82aAd9D32EBb',
    [ChainId.DFK_TESTNET]: '0xa5c47B4bEb35215fB0CF0Ea6516F9921591c3aCE'
  }
})
