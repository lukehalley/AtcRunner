import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import fortitudeStoneImage from '../images/fortitude-stone-greater.gif'
import { ItemKeys, ItemType } from '../types'

export const fortitudeStoneGreater = new Item({
  key: ItemKeys.FORTITUDE_STONE_GREATER,
  name: 'Greater Fortitude Stone',
  description:
    'Applies bonus to new Hero when summoning:<ul><li>+8 END</li><li>+7% to Primary Stat Growth</li><li>+21% to Secondary Stat Growth</li></ul>',
  image: fortitudeStoneImage,
  type: ItemType.STONE,
  tokenSymbol: 'DFKGFRTIST',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x27AF2A00B42Dcc0084A6Dc99169efbFE98eb140C',
    [ChainId.HARMONY_TESTNET]: '0x90D1f603BdAd4eC33aA385406Fe79d3C28832C5d'
  }
})
