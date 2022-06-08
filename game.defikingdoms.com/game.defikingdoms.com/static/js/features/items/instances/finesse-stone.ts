import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import finesseStoneImage from '../images/finesse-stone.gif'
import { ItemKeys, ItemType } from '../types'

export const finesseStone = new Item({
  key: ItemKeys.FINESSE_STONE,
  name: 'Finesse Stone',
  description:
    'Applies bonus to new Hero when summoning:<ul><li>+6 DEX</li><li>+5% to Primary Stat Growth</li><li>+13% to Secondary Stat Growth</li></ul>',
  image: finesseStoneImage,
  type: ItemType.STONE,
  tokenSymbol: 'DFKFINST',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0xD0B689Cb5DE0c15792Aa456C89D64038C1F2EedC',
    [ChainId.HARMONY_TESTNET]: '0x16cc1683243CAEB45B840720aF86b24916457EB9'
  }
})
