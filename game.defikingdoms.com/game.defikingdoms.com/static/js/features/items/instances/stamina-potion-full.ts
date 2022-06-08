import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import staminaPotionFullImage from '../images/stamina-potion-large.gif'
import { ItemKeys, ItemType } from '../types'

export const staminaPotionFull = new Item({
  key: ItemKeys.STAMINA_POTION_LARGE,
  name: 'Stamina Pot',
  description: 'Restores a good amount of stamina.',
  image: staminaPotionFullImage,
  type: ItemType.POTION,
  addresses: {
    [ChainId.HARMONY_MAINNET]: ZERO_ONE_ADDRESS,
    [ChainId.HARMONY_TESTNET]: ZERO_ONE_ADDRESS
  }
})
