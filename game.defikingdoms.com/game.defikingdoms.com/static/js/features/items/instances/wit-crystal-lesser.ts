import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import witCrystalImage from '../images/wit-crystal-lesser.gif'
import { ItemKeys, ItemType } from '../types'

export const witCrystalLesser = new Item({
  key: ItemKeys.WIT_CRYSTAL_LESSER,
  name: 'Lesser Wit Crystal',
  description:
    'Applies the following temporary modifiers when leveling:<ul><li>+5% to Primary Stat Growth roll for INT</li><li>+15% to Secondary Stat Growth roll for INT</li></ul>',
  image: witCrystalImage,
  type: ItemType.CRYSTAL,
  tokenSymbol: 'DFKLWITCR',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x17ff2016c9ecCFBF4Fc4DA6EF95Fe646D2c9104F',
    [ChainId.HARMONY_TESTNET]: '0x436Aa99f5024DbeD2BeF82aB4B1b675ed1746A96'
  }
})
