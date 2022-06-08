import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import fortuneCrystalImage from '../images/fortune-crystal-greater.gif'
import { ItemKeys, ItemType } from '../types'

export const fortuneCrystalGreater = new Item({
  key: ItemKeys.FORTUNE_CRYSTAL_GREATER,
  name: 'Greater Fortune Crystal',
  description:
    'Applies the following temporary modifiers when leveling:<ul><li>+15% to Primary Stat Growth roll for LCK</li><li>+45% to Secondary Stat Growth roll for LCK</li></ul>',
  image: fortuneCrystalImage,
  type: ItemType.CRYSTAL,
  tokenSymbol: 'DFKGFRTUCR',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x2bC1112337B90bF8c5b9422bC1e98193a9C3d1f4',
    [ChainId.HARMONY_TESTNET]: '0x670fB2d0cD645BD094aEcdDfEcbfA68Ab01A5aEf'
  }
})
