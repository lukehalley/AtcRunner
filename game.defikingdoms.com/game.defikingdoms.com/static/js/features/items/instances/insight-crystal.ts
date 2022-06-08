import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import insightCrystalImage from '../images/insight-crystal.gif'
import { ItemKeys, ItemType } from '../types'

export const insightCrystal = new Item({
  key: ItemKeys.INSIGHT_CRYSTAL,
  name: 'Insight Crystal',
  description:
    'Applies the following temporary modifiers when leveling:<ul><li>+10% to Primary Stat Growth roll for WIS</li><li>+30% to Secondary Stat Growth roll for WIS</li></ul>',
  image: insightCrystalImage,
  type: ItemType.CRYSTAL,
  tokenSymbol: 'DFKINSCR',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x117E60775584CdfA4f414E22b075F31cC9c3207C',
    [ChainId.HARMONY_TESTNET]: '0xD2c6C2caC41Ef18816f439c048B323cd202Af45b'
  }
})
