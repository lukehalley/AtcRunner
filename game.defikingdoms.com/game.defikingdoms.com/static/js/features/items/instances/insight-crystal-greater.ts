import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import insightCrystalImage from '../images/insight-crystal-greater.gif'
import { ItemKeys, ItemType } from '../types'

export const insightCrystalGreater = new Item({
  key: ItemKeys.INSIGHT_CRYSTAL_GREATER,
  name: 'Greater Insight Crystal',
  description:
    'Applies the following temporary modifiers when leveling:<ul><li>+15% to Primary Stat Growth roll for WIS</li><li>+45% to Secondary Stat Growth roll for WIS</li></ul>',
  image: insightCrystalImage,
  type: ItemType.CRYSTAL,
  tokenSymbol: 'DFKGINSCR',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x90454DbF13846CF960abc0F583c319B06aB3F280',
    [ChainId.HARMONY_TESTNET]: '0xf9a37D029bE5D96A33C9D6e985F1F896804ee3F6'
  }
})
