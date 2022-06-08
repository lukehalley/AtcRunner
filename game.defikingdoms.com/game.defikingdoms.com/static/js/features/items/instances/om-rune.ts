import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import omRuneImage from '../images/om-rune.png'
import { ItemKeys, ItemType } from '../types'

export const omRune = new Item({
  key: ItemKeys.OM_RUNE,
  name: 'Om Rune',
  description: 'A truly astounding item.',
  image: omRuneImage,
  type: ItemType.RUNE,
  addresses: {
    [ChainId.HARMONY_MAINNET]: ZERO_ONE_ADDRESS,
    [ChainId.HARMONY_TESTNET]: ZERO_ONE_ADDRESS
  }
})
