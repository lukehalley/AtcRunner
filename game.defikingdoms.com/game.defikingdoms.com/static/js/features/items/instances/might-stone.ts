import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import mightStoneImage from '../images/might-stone.gif'
import { ItemKeys, ItemType } from '../types'

export const mightStone = new Item({
  key: ItemKeys.MIGHT_STONE,
  name: 'Might Stone',
  description:
    'Applies bonus to new Hero when summoning:<ul><li>+6 STR</li><li>+5% to Primary Stat Growth</li><li>+13% to Secondary Stat Growth</li></ul>',
  image: mightStoneImage,
  type: ItemType.STONE,
  tokenSymbol: 'DFKMGHTST',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0xE7F6ea1cE7BbEbC9F2Cf080010dd938d2D8D8B1b',
    [ChainId.HARMONY_TESTNET]: '0x677028bcDbdb4A5bCDc49fEa97517566b0021C0f'
  }
})
