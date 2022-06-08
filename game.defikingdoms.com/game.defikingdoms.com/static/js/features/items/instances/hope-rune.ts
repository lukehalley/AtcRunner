import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import hopeRuneImage from '../images/hope-rune.png'
import { ItemKeys, ItemType } from '../types'

export const hopeRune = new Item({
  key: ItemKeys.HOPE_RUNE,
  name: 'Hope Rune',
  description: 'A truly astounding item.',
  image: hopeRuneImage,
  type: ItemType.RUNE,
  addresses: {
    [ChainId.HARMONY_MAINNET]: ZERO_ONE_ADDRESS,
    [ChainId.HARMONY_TESTNET]: ZERO_ONE_ADDRESS
  }
})
