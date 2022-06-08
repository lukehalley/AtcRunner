import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import goldPileImage from '../images/gold-pile.png'
import { ItemKeys, ItemType } from '../types'

export const goldPile = new Item({
  key: ItemKeys.GOLD_PILE,
  name: 'Gold Pile',
  description: 'A truly astounding item.',
  image: goldPileImage,
  type: ItemType.MATERIAL,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x3a4EDcf3312f44EF027acfd8c21382a5259936e7',
    [ChainId.HARMONY_TESTNET]: '0x24B46b91E0862221D39dd30FAAd63999717860Ab'
  },
  tokenSymbol: 'DFKGOLD'
})
