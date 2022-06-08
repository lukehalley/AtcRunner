import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import ironIngotImage from '../images/iron-ingot.png'
import { ItemKeys, ItemType } from '../types'

export const ironIngot = new Item({
  key: ItemKeys.IRON_INGOT,
  name: 'Iron Ingot',
  description: 'A truly astounding item.',
  image: ironIngotImage,
  type: ItemType.MATERIAL,
  addresses: {
    [ChainId.HARMONY_MAINNET]: ZERO_ONE_ADDRESS,
    [ChainId.HARMONY_TESTNET]: ZERO_ONE_ADDRESS
  }
})
