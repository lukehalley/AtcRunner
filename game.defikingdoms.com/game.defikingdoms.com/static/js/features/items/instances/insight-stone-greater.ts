import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import insightStoneImage from '../images/insight-stone-greater.gif'
import { ItemKeys, ItemType } from '../types'

export const insightStoneGreater = new Item({
  key: ItemKeys.INSIGHT_STONE_GREATER,
  name: 'Greater Insight Stone',
  description:
    'Applies bonus to new Hero when summoning:<ul><li>+8 WIS</li><li>+7% to Primary Stat Growth</li><li>+21% to Secondary Stat Growth</li></ul>',
  image: insightStoneImage,
  type: ItemType.STONE,
  tokenSymbol: 'DFKGINSST',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x40654Da5a038963fA9750AF352ae9d3b1da2baD0',
    [ChainId.HARMONY_TESTNET]: '0x706820E32fbdCdc52d2866dB096E6dF8C1b6175A'
  }
})
