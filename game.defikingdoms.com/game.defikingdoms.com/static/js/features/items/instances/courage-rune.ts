import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import courageRuneImage from '../images/courage-rune.png'
import { ItemKeys, ItemType } from '../types'

export const courageRune = new Item({
  key: ItemKeys.COURAGE_RUNE,
  name: 'Courage Rune',
  description: 'A truly astounding item.',
  image: courageRuneImage,
  type: ItemType.RUNE,
  addresses: {
    [ChainId.HARMONY_MAINNET]: ZERO_ONE_ADDRESS,
    [ChainId.HARMONY_TESTNET]: ZERO_ONE_ADDRESS
  }
})
