import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import fortuneCrystalImage from '../images/fortune-crystal-lesser.gif'
import { ItemKeys, ItemType } from '../types'

export const fortuneCrystalLesser = new Item({
  key: ItemKeys.FORTUNE_CRYSTAL_LESSER,
  name: 'Lesser Fortune Crystal',
  description:
    'Applies the following temporary modifiers when leveling:<ul><li>+5% to Primary Stat Growth roll for LCK</li><li>+15% to Secondary Stat Growth roll for LCK</li></ul>',
  image: fortuneCrystalImage,
  type: ItemType.CRYSTAL,
  tokenSymbol: 'DFKLFRTUCR',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x13AF184aEA970Fe79E3BB7A1B0B156B195fB1f40',
    [ChainId.HARMONY_TESTNET]: '0xD36Ce1d217F2Bb548a0bf256686380619Fe897cC'
  }
})
