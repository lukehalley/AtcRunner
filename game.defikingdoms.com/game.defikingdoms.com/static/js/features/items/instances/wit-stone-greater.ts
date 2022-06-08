import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import witStoneImage from '../images/wit-stone-greater.gif'
import { ItemKeys, ItemType } from '../types'

export const witStoneGreater = new Item({
  key: ItemKeys.WIT_STONE_GREATER,
  name: 'Greater Wit Stone',
  description:
    'Applies bonus to new Hero when summoning:<ul><li>+8 INT</li><li>+7% to Primary Stat Growth</li><li>+21% to Secondary Stat Growth</li></ul>',
  image: witStoneImage,
  type: ItemType.STONE,
  tokenSymbol: 'DFKGWITST',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0xa6e86F2b43Ae73cfB09A3bA779AeB8Fd48417ba0',
    [ChainId.HARMONY_TESTNET]: '0xc4B03E7432FADc938994588b9f78f6667a5d0eF9'
  }
})
