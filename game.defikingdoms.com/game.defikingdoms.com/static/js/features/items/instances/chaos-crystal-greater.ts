import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import chaosCrystalImage from '../images/chaos-crystal-greater.gif'
import { ItemKeys, ItemType } from '../types'

export const chaosCrystalGreater = new Item({
  key: ItemKeys.CHAOS_CRYSTAL_GREATER,
  name: 'Greater Chaos Crystal',
  description:
    'Applies the following temporary modifiers when leveling:<ul><li>+15% to Primary Stat Growth roll for a random stat</li><li>+45% to Secondary Stat Growth roll for a random stat</li></ul>',
  image: chaosCrystalImage,
  type: ItemType.CRYSTAL,
  tokenSymbol: 'DFKGCHSCR',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x423bbec25e4888967baeDB7B4EC5b0465Fa3B87D',
    [ChainId.HARMONY_TESTNET]: '0xe7BE74dB003E74427Fd0C74b9f9B8D72A7a7E83E'
  }
})
