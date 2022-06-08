import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import shvasRuneImage from '../images/shvas-rune.gif'
import { ItemKeys, ItemType } from '../types'

export const shvasRune = new Item({
  key: ItemKeys.SHVAS_RUNE,
  name: 'Shvas Rune',
  description: 'This rune pulses with power. Watching it, you begin to breathe in its rhythm...',
  image: shvasRuneImage,
  type: ItemType.RUNE,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x66F5BfD910cd83d3766c4B39d13730C911b2D286',
    [ChainId.HARMONY_TESTNET]: '0x457A99042D3ba3b61A036f3dC801243670c87c51'
  },
  tokenSymbol: 'DFKSHVAS',
  featuredMetric: true
})
