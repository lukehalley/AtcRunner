import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import wisdomRuneImage from '../images/wisdom-rune.png'
import { ItemKeys, ItemType } from '../types'

export const wisdomRune = new Item({
  key: ItemKeys.WISDOM_RUNE,
  name: 'Wisdom Rune',
  description: 'Opens your mind and expands your senses.',
  image: wisdomRuneImage,
  type: ItemType.RUNE,
  addresses: {
    [ChainId.HARMONY_MAINNET]: ZERO_ONE_ADDRESS,
    [ChainId.HARMONY_TESTNET]: ZERO_ONE_ADDRESS
  }
})
