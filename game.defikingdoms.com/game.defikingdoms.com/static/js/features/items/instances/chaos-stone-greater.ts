import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import chaosStoneImage from '../images/chaos-stone-greater.gif'
import { ItemKeys, ItemType } from '../types'

export const chaosStoneGreater = new Item({
  key: ItemKeys.CHAOS_STONE_GREATER,
  name: 'Greater Chaos Stone',
  description:
    'Applies bonus to new Hero when summoning:<ul><li>+8 bonus to a random stat</li><li>+7% to Primary Stat Growth of that stat</li><li>+21% to Secondary Stat Growth of that stat</li></ul>',
  image: chaosStoneImage,
  type: ItemType.STONE,
  tokenSymbol: 'DFKGCHSST',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x2fB31FF9E9945c5c1911386865cD666b2C5dfeB6',
    [ChainId.HARMONY_TESTNET]: '0xBf52D66907BE64B904081670D246375e828581e8'
  }
})
