import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import chaosCrystalImage from '../images/chaos-crystal.gif'
import { ItemKeys, ItemType } from '../types'

export const chaosCrystal = new Item({
  key: ItemKeys.CHAOS_CRYSTAL,
  name: 'Chaos Crystal',
  description:
    'Applies the following temporary modifiers when leveling:<ul><li>+10% to Primary Stat Growth roll for random stat</li><li>+30% to Secondary Stat Growth roll for random stat</li></ul>',
  image: chaosCrystalImage,
  type: ItemType.CRYSTAL,
  tokenSymbol: 'DFKCHSCR',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x45B53E55b5c0A10fdd4fE2079a562d5702F3A033',
    [ChainId.HARMONY_TESTNET]: '0x0c60d9A0a69E7c50f8113a98f9bAB30AD66614a3'
  }
})
