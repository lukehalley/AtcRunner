import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import mightStoneImage from '../images/might-stone-greater.gif'
import { ItemKeys, ItemType } from '../types'

export const mightStoneGreater = new Item({
  key: ItemKeys.MIGHT_STONE_GREATER,
  name: 'Greater Might Stone',
  description:
    'Applies bonus to new Hero when summoning:<ul><li>+8 STR</li><li>+7% to Primary Stat Growth</li><li>+21% to Secondary Stat Growth</li></ul>',
  image: mightStoneImage,
  type: ItemType.STONE,
  tokenSymbol: 'DFKGMGHTST',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x2bc05bf05E273a2276F19a8Bd6738e742A5685b3',
    [ChainId.HARMONY_TESTNET]: '0x0513f27Af88cCc9cFEB0093A3e370fE793BF0F94'
  }
})
