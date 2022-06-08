import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import chaosStoneImage from '../images/chaos-stone.gif'
import { ItemKeys, ItemType } from '../types'

export const chaosStone = new Item({
  key: ItemKeys.CHAOS_STONE,
  name: 'Chaos Stone',
  description:
    'Applies bonus to new Hero when summoning:<ul><li>+6 bonus to a random stat</li><li>+5% to Primary Stat Growth of that stat</li><li>+13% to Secondary Stat Growth of that stat</li></ul>',
  image: chaosStoneImage,
  type: ItemType.STONE,
  tokenSymbol: 'DFKCHSST',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x3633F956410163A98D58D2D928B38C64A488654e',
    [ChainId.HARMONY_TESTNET]: '0x564C20F0E257531464B3c1AB9e827b74C95BC9e2'
  }
})
