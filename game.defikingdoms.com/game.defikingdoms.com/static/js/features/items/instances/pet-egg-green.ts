import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import petEggGreenImage from '../images/pet-egg-green.png'
import { ItemKeys, ItemType } from '../types'

export const petEggGreen = new Item({
  key: ItemKeys.PET_EGG_GREEN,
  name: 'Green Pet Egg',
  description: 'If you put your ear against it, you can hear a soft noise.',
  image: petEggGreenImage,
  type: ItemType.PET,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x6d605303e9Ac53C59A3Da1ecE36C9660c7A71da5',
    [ChainId.HARMONY_TESTNET]: '0xa5fFbff0b47B05cAd7Ab217Ea103F546a4Dae31F'
  },
  tokenSymbol: 'DFKGREENEGG',
  featuredMetric: true
})
