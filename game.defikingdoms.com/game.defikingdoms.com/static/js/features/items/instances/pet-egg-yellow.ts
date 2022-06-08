import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import petEggYellowImage from '../images/pet-egg-yellow.png'
import { ItemKeys, ItemType } from '../types'

export const petEggYellow = new Item({
  key: ItemKeys.PET_EGG_YELLOW,
  name: 'Yellow Pet Egg',
  description: 'You sense something slumbering inside.',
  image: petEggYellowImage,
  type: ItemType.PET,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x3dB1fd0Ad479A46216919758144FD15A21C3e93c',
    [ChainId.HARMONY_TESTNET]: '0x6D02EF7f7686c3330a40A0AD9218b66A957C9405'
  },
  tokenSymbol: 'DFKYELOWEGG',
  featuredMetric: true
})
