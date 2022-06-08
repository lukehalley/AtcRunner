import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import vigorStoneImage from '../images/vigor-stone-greater.gif'
import { ItemKeys, ItemType } from '../types'

export const vigorStoneGreater = new Item({
  key: ItemKeys.VIGOR_STONE_GREATER,
  name: 'Greater Vigor Stone',
  description:
    'Applies bonus to new Hero when summoning:<ul><li>+8 VIT</li><li>+7% to Primary Stat Growth</li><li>+21% to Secondary Stat Growth</li></ul>',
  image: vigorStoneImage,
  type: ItemType.STONE,
  tokenSymbol: 'DFKGVGRST',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x00a2E2F8Feb81FDB7205992B5Abd2a801b419394',
    [ChainId.HARMONY_TESTNET]: '0x9d02e773D0AAe3601c0baC2f0a8a199D50162F12'
  }
})
