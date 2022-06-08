import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import breatheRuneImage from '../images/breathe-rune.png'
import { ItemKeys, ItemType } from '../types'

export const breatheRune = new Item({
  key: ItemKeys.BREATHE_RUNE,
  name: 'Breathe Rune',
  description: 'A truly astounding item.',
  image: breatheRuneImage,
  type: ItemType.RUNE,
  addresses: {
    [ChainId.HARMONY_MAINNET]: ZERO_ONE_ADDRESS,
    [ChainId.HARMONY_TESTNET]: ZERO_ONE_ADDRESS
  }
})
