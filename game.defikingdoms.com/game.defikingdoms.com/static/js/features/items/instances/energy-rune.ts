import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import energyRuneImage from '../images/energy-rune.png'
import { ItemKeys, ItemType } from '../types'

export const energyRune = new Item({
  key: ItemKeys.ENERGY_RUNE,
  name: 'Energy Rune ',
  description: 'A truly astounding item.',
  image: energyRuneImage,
  type: ItemType.RUNE,
  addresses: {
    [ChainId.HARMONY_MAINNET]: ZERO_ONE_ADDRESS,
    [ChainId.HARMONY_TESTNET]: ZERO_ONE_ADDRESS
  }
})
