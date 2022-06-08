import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import insightStoneImage from '../images/insight-stone.gif'
import { ItemKeys, ItemType } from '../types'

export const insightStone = new Item({
  key: ItemKeys.INSIGHT_STONE,
  name: 'Insight Stone',
  description:
    'Applies bonus to new Hero when summoning:<ul><li>+6 WIS</li><li>+5% to Primary Stat Growth</li><li>+13% to Secondary Stat Growth</li></ul>',
  image: insightStoneImage,
  type: ItemType.STONE,
  tokenSymbol: 'DFKINSST',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x9D71Bb9C781FC2eBdD3d6cb709438e3c71200149',
    [ChainId.HARMONY_TESTNET]: '0x9138b74BeE92AC3c45BbA24389BF913BA3a42Ba2'
  }
})
