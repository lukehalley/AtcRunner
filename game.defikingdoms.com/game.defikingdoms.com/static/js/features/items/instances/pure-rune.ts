import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import pureRuneImage from '../images/pure-rune.png'
import { ItemKeys, ItemType } from '../types'

export const pureRune = new Item({
  key: ItemKeys.PURE_RUNE,
  name: 'Pure Rune',
  description: 'A truly astounding item.',
  image: pureRuneImage,
  type: ItemType.RUNE,
  addresses: {
    [ChainId.HARMONY_MAINNET]: ZERO_ONE_ADDRESS,
    [ChainId.HARMONY_TESTNET]: ZERO_ONE_ADDRESS
  }
})
