import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import fortuneStoneImage from '../images/fortune-stone.gif'
import { ItemKeys, ItemType } from '../types'

export const fortuneStone = new Item({
  key: ItemKeys.FORTUNE_STONE,
  name: 'Fortune Stone',
  description:
    'Applies bonus to new Hero when summoning:<ul><li>+6 LCK</li><li>+5% to Primary Stat Growth</li><li>+13% to Secondary Stat Growth</li></ul>',
  image: fortuneStoneImage,
  type: ItemType.STONE,
  tokenSymbol: 'DFKFRTUST',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x5da2EffE9857DcEcB786E13566Ff37B92e1E6862',
    [ChainId.HARMONY_TESTNET]: '0x7EE9e78557c10B0aE149506f51104D88a73B957f'
  }
})
