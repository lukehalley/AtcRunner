import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import fortitudeStoneImage from '../images/fortitude-stone.gif'
import { ItemKeys, ItemType } from '../types'

export const fortitudeStone = new Item({
  key: ItemKeys.FORTITUDE_STONE,
  name: 'Fortitude Stone',
  description:
    'Applies bonus to new Hero when summoning:<ul><li>+6 END</li><li>+5% to Primary Stat Growth</li><li>+13% to Secondary Stat Growth</li></ul>',
  image: fortitudeStoneImage,
  type: ItemType.STONE,
  tokenSymbol: 'DFKFRTIST',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x17Fa96ba9d9C29e4B96d29A7e89a4E7B240E3343',
    [ChainId.HARMONY_TESTNET]: '0xD7D89A1457B40570166e46c449CabD661Dbe0e76'
  }
})
