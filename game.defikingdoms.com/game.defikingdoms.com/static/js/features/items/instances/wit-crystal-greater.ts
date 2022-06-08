import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import witCrystalImage from '../images/wit-crystal-greater.gif'
import { ItemKeys, ItemType } from '../types'

export const witCrystalGreater = new Item({
  key: ItemKeys.WIT_CRYSTAL_GREATER,
  name: 'Greater Wit Crystal',
  description:
    'Applies the following temporary modifiers when leveling:<ul><li>+15% to Primary Stat Growth roll for INT</li><li>+45% to Secondary Stat Growth roll for INT</li></ul>',
  image: witCrystalImage,
  type: ItemType.CRYSTAL,
  tokenSymbol: 'DFKGWITCR',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0xbaAb8dB69a2FdC0b88B2B3F6F75Fa8899680c43B',
    [ChainId.HARMONY_TESTNET]: '0x070f589f24BCCef071a99BedD1737e0CF0919DaE'
  }
})
