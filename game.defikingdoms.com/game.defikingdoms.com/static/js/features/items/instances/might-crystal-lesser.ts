import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import mightCrystalImage from '../images/might-crystal-lesser.gif'
import { ItemKeys, ItemType } from '../types'

export const mightCrystalLesser = new Item({
  key: ItemKeys.MIGHT_CRYSTAL_LESSER,
  name: 'Lesser Might Crystal',
  description:
    'Applies the following temporary modifiers when leveling:<ul><li>+5% to Primary Stat Growth roll for STR</li><li>+15% to Secondary Stat Growth roll for STR</li></ul>',
  image: mightCrystalImage,
  type: ItemType.CRYSTAL,
  tokenSymbol: 'DFKLMGHTCR',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0xaB464901AFBc61bAC440a97Fa568aC42885Da58B',
    [ChainId.HARMONY_TESTNET]: '0x2DE38B2cd4E76E8ff2d03515363480df69531511'
  }
})
