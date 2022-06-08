import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import witStoneImage from '../images/wit-stone.gif'
import { ItemKeys, ItemType } from '../types'

export const witStone = new Item({
  key: ItemKeys.WIT_STONE,
  name: 'Wit Stone',
  description:
    'Applies bonus to new Hero when summoning:<ul><li>+6 INT</li><li>+5% to Primary Stat Growth</li><li>+13% to Secondary Stat Growth</li></ul>',
  image: witStoneImage,
  type: ItemType.STONE,
  tokenSymbol: 'DFKWITST',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x939Ea05C81aAC48F7C10BdB08615082B82C80c63',
    [ChainId.HARMONY_TESTNET]: '0x3287a5E500E2131D972f67cB04b113483277d339'
  }
})
