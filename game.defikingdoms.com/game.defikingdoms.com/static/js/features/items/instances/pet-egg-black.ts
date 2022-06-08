import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import petEggBlackImage from '../images/pet-egg-black.png'
import { ItemKeys, ItemType } from '../types'

export const petEggBlack = new Item({
  key: ItemKeys.PET_EGG_BLACK,
  name: 'Black Pet Egg',
  description: 'You think this egg might have been incubated too long.',
  image: petEggBlackImage,
  type: ItemType.PET,
  addresses: {
    [ChainId.HARMONY_MAINNET]: ZERO_ONE_ADDRESS,
    [ChainId.HARMONY_TESTNET]: ZERO_ONE_ADDRESS
  }
})
