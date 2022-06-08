import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import soulRuneImage from '../images/soul-rune.png'
import { ItemKeys, ItemType } from '../types'

export const soulRune = new Item({
  key: ItemKeys.SOUL_RUNE,
  name: 'Soul Rune',
  description: 'A truly astounding item.',
  image: soulRuneImage,
  type: ItemType.RUNE,
  addresses: {
    [ChainId.HARMONY_MAINNET]: ZERO_ONE_ADDRESS,
    [ChainId.HARMONY_TESTNET]: ZERO_ONE_ADDRESS
  }
})
