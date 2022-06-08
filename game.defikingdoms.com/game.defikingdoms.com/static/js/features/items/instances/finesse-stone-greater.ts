import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import finesseStoneImage from '../images/finesse-stone-greater.gif'
import { ItemKeys, ItemType } from '../types'

export const finesseStoneGreater = new Item({
  key: ItemKeys.FINESSE_STONE_GREATER,
  name: 'Greater Finesse Stone',
  description:
    'Applies bonus to new Hero when summoning:<ul><li>+8 DEX</li><li>+7% to Primary Stat Growth</li><li>+21% to Secondary Stat Growth</li></ul>',
  image: finesseStoneImage,
  type: ItemType.STONE,
  tokenSymbol: 'DFKGFINST',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x20f10ef23Cdc11Fa55E6B3703d88f19A7B345D15',
    [ChainId.HARMONY_TESTNET]: '0x4F5815d68fab431431Ee36c1a18dA41d36125bB1'
  }
})
