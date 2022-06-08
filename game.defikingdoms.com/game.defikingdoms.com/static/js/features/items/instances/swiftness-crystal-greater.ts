import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import swiftnessCrystalImage from '../images/swiftness-crystal-greater.gif'
import { ItemKeys, ItemType } from '../types'

export const swiftnessCrystalGreater = new Item({
  key: ItemKeys.SWIFTNESS_CRYSTAL_GREATER,
  name: 'Greater Swiftness Crystal',
  description:
    'Applies the following temporary modifiers when leveling:<ul><li>+15% to Primary Stat Growth roll for AGI</li><li>+45% to Secondary Stat Growth roll for AGI</li></ul>',
  image: swiftnessCrystalImage,
  type: ItemType.CRYSTAL,
  tokenSymbol: 'DFKGSWFTCR',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x1e38e63227D52CBaDA2f0c11bE04feD64154ea37',
    [ChainId.HARMONY_TESTNET]: '0x46f743832447f621a34472C69E0456836820520c'
  }
})
