import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import swiftnessCrystalImage from '../images/swiftness-crystal.gif'
import { ItemKeys, ItemType } from '../types'

export const swiftnessCrystal = new Item({
  key: ItemKeys.SWIFTNESS_CRYSTAL,
  name: 'Swiftness Crystal',
  description:
    'Applies the following temporary modifiers when leveling:<ul><li>+10% to Primary Stat Growth roll for AGI</li><li>+30% to Secondary Stat Growth roll for AGI</li></ul>',
  image: swiftnessCrystalImage,
  type: ItemType.CRYSTAL,
  tokenSymbol: 'DFKSWFTCR',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x5d7f20e3B0f1406Bf038175218eA7e9B4838908c',
    [ChainId.HARMONY_TESTNET]: '0x9D3180dbd920a0148e256A330bc371437A6C2Ca4'
  }
})
