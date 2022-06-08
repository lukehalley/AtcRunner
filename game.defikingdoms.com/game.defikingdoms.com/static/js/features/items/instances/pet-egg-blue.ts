import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import petEggBlueImage from '../images/pet-egg-blue.png'
import { ItemKeys, ItemType } from '../types'

export const petEggBlue = new Item({
  key: ItemKeys.PET_EGG_BLUE,
  name: 'Blue Pet Egg',
  description: 'An aquatic-looking egg.',
  image: petEggBlueImage,
  type: ItemType.PET,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x9678518e04Fe02FB30b55e2D0e554E26306d0892',
    [ChainId.HARMONY_TESTNET]: '0x9D9675170946eAffb3A750DB75AB4B559cC91668'
  },
  tokenSymbol: 'DFKBLUEEGG',
  featuredMetric: true
})
