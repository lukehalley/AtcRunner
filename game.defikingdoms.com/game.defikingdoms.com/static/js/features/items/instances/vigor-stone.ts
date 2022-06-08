import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import vigorStoneImage from '../images/vigor-stone.gif'
import { ItemKeys, ItemType } from '../types'

export const vigorStone = new Item({
  key: ItemKeys.VIGOR_STONE,
  name: 'Vigor Stone',
  description:
    'Applies bonus to new Hero when summoning:<ul><li>+6 VIT</li><li>+5% to Primary Stat Growth</li><li>+13% to Secondary Stat Growth</li></ul>',
  image: vigorStoneImage,
  type: ItemType.STONE,
  tokenSymbol: 'DFKVGRST',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x9df75917aC9747B4A70fa033E4b0182d85B62857',
    [ChainId.HARMONY_TESTNET]: '0xDa8a43B05196A9235c81508e90f0393c4C88201c'
  }
})
