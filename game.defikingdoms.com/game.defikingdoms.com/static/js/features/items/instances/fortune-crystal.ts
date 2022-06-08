import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import fortuneCrystalImage from '../images/fortune-crystal.gif'
import { ItemKeys, ItemType } from '../types'

export const fortuneCrystal = new Item({
  key: ItemKeys.FORTUNE_CRYSTAL,
  name: 'Fortune Crystal',
  description:
    'Applies the following temporary modifiers when leveling:<ul><li>+10% to Primary Stat Growth roll for LCK</li><li>+30% to Secondary Stat Growth roll for LCK</li></ul>',
  image: fortuneCrystalImage,
  type: ItemType.CRYSTAL,
  tokenSymbol: 'DFKFRTUCR',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x6D777C64f0320d8A5b31BE0FdeB694007Fc3ed45',
    [ChainId.HARMONY_TESTNET]: '0x554f36cA3aEffC9792E7368af516F687F94c22Cb'
  }
})
