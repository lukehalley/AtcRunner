import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import lightRuneImage from '../images/light-rune.png'
import { ItemKeys, ItemType } from '../types'

export const lightRune = new Item({
  key: ItemKeys.LIGHT_RUNE,
  name: 'Light Rune',
  description: 'A truly astounding item.',
  image: lightRuneImage,
  type: ItemType.RUNE,
  addresses: {
    [ChainId.HARMONY_MAINNET]: ZERO_ONE_ADDRESS,
    [ChainId.HARMONY_TESTNET]: ZERO_ONE_ADDRESS
  }
})
