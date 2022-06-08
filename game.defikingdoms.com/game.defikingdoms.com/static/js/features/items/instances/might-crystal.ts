import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import mightCrystalImage from '../images/might-crystal.gif'
import { ItemKeys, ItemType } from '../types'

export const mightCrystal = new Item({
  key: ItemKeys.MIGHT_CRYSTAL,
  name: 'Might Crystal',
  description:
    'Applies the following temporary modifiers when leveling:<ul><li>+10% to Primary Stat Growth roll for STR</li><li>+30% to Secondary Stat Growth roll for STR</li></ul>',
  image: mightCrystalImage,
  type: ItemType.CRYSTAL,
  tokenSymbol: 'DFKMGHTCR',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0xb368f69bE6eDa74700763672AEB2Ae63f3d20AE6',
    [ChainId.HARMONY_TESTNET]: '0x26b31ECe9BfdC5b1692a3D4362DB654607598236'
  }
})
