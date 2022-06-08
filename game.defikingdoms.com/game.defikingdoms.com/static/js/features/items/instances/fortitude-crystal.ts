import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import fortitudeCrystalImage from '../images/fortitude-crystal.gif'
import { ItemKeys, ItemType } from '../types'

export const fortitudeCrystal = new Item({
  key: ItemKeys.FORTITUDE_CRYSTAL,
  name: 'Fortitude Crystal',
  description:
    'Applies the following temporary modifiers when leveling:<ul><li>+10% to Primary Stat Growth roll for END</li><li>+30% to Secondary Stat Growth roll for END</li></ul>',
  image: fortitudeCrystalImage,
  type: ItemType.CRYSTAL,
  tokenSymbol: 'DFKFRTICR',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x603919AEB55EB13F9CDE94274fC54ab2Bd2DecE7',
    [ChainId.HARMONY_TESTNET]: '0x352E42f246a9ca79139D4Cfc7817494DC7EDaCf7'
  }
})
