import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import swiftnessCrystalImage from '../images/swiftness-crystal-lesser.gif'
import { ItemKeys, ItemType } from '../types'

export const swiftnessCrystalLesser = new Item({
  key: ItemKeys.SWIFTNESS_CRYSTAL_LESSER,
  name: 'Lesser Swiftness Crystal',
  description:
    'Applies the following temporary modifiers when leveling:<ul><li>+5% to Primary Stat Growth roll for AGI</li><li>+15% to Secondary Stat Growth roll for AGI</li></ul>',
  image: swiftnessCrystalImage,
  type: ItemType.CRYSTAL,
  tokenSymbol: 'DFKLSWFTCR',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0xf5c26F2F34E9245C3A9ea0B0e7Ea7B33E6404Da0',
    [ChainId.HARMONY_TESTNET]: '0x6371C5c57C6169d39e6460891cB55b2647197785'
  }
})
