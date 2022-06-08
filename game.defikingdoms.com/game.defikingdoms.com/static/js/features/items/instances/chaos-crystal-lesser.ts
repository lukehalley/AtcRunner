import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import chaosCrystalImage from '../images/chaos-crystal-lesser.gif'
import { ItemKeys, ItemType } from '../types'

export const chaosCrystalLesser = new Item({
  key: ItemKeys.CHAOS_CRYSTAL_LESSER,
  name: 'Lesser Chaos Crystal',
  description:
    'Applies the following temporary modifiers when leveling:<ul><li>+5% to Primary Stat Growth roll for random stat</li><li>+15% to Secondary Stat Growth roll for random stat</li></ul>',
  image: chaosCrystalImage,
  type: ItemType.CRYSTAL,
  tokenSymbol: 'DFKLCHSCR',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0xa509c34306AdF6168268A213Cc47D336630bf101',
    [ChainId.HARMONY_TESTNET]: '0xF71c52DABB711f2cdaf2e6dA68654f2E927dbb23'
  }
})
