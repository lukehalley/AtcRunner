import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import insightCrystalImage from '../images/insight-crystal-lesser.gif'
import { ItemKeys, ItemType } from '../types'

export const insightCrystalLesser = new Item({
  key: ItemKeys.INSIGHT_CRYSTAL_LESSER,
  name: 'Lesser Insight Crystal',
  description:
    'Applies the following temporary modifiers when leveling:<ul><li>+5% to Primary Stat Growth roll for WIS</li><li>+15% to Secondary Stat Growth roll for WIS</li></ul>',
  image: insightCrystalImage,
  type: ItemType.CRYSTAL,
  tokenSymbol: 'DFKLINSCR',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0xc63b76f710e9973b8989678eb16234CfADc8D9DB',
    [ChainId.HARMONY_TESTNET]: '0x26Bd14dE3ad724E5E889cE5726Cc374463Ecee9D'
  }
})
