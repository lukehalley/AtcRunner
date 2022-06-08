import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import mokshaRuneImage from '../images/moksha-rune.gif'
import { ItemKeys, ItemType } from '../types'

export const mokshaRune = new Item({
  key: ItemKeys.MOKSHA_RUNE,
  name: 'Moksha Rune',
  description: 'The rune pulses in your palm, the burdens on your mind witness liberation...',
  image: mokshaRuneImage,
  type: ItemType.RUNE,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x8F655142104478724bbC72664042EA09EBbF7B38',
    [ChainId.HARMONY_TESTNET]: '0x3e36768498A678bF3b36D2aF5d3d5974dC6d209a'
  },
  tokenSymbol: 'DFKMOKSHA'
})
