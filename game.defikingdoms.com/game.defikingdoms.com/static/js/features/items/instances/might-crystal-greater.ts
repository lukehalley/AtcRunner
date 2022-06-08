import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import mightCrystalImage from '../images/might-crystal-greater.gif'
import { ItemKeys, ItemType } from '../types'

export const mightCrystalGreater = new Item({
  key: ItemKeys.MIGHT_CRYSTAL_GREATER,
  name: 'Greater Might Crystal',
  description:
    'Applies the following temporary modifiers when leveling:<ul><li>+15% to Primary Stat Growth roll for STR</li><li>+45% to Secondary Stat Growth roll for STR</li></ul>',
  image: mightCrystalImage,
  type: ItemType.CRYSTAL,
  tokenSymbol: 'DFKGMGHTCR',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0xdFA5aE156AD4590A0061E9c4E8cc5bd60bc775c7',
    [ChainId.HARMONY_TESTNET]: '0x026CaD2dc3d83E8D5E4390bD6e0FaE147eDda9aD'
  }
})
