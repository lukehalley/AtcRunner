import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import goldIngotImage from '../images/gold-ingot.png'
import { ItemKeys, ItemType } from '../types'

export const goldIngot = new Item({
  key: ItemKeys.GOLD_INGOT,
  name: 'Gold Ingot',
  description: 'A truly astounding item.',
  image: goldIngotImage,
  type: ItemType.MATERIAL,
  addresses: {
    [ChainId.HARMONY_MAINNET]: ZERO_ONE_ADDRESS,
    [ChainId.HARMONY_TESTNET]: ZERO_ONE_ADDRESS
  }
})
