import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import finesseStoneImage from '../images/finesse-stone-lesser.gif'
import { ItemKeys, ItemType } from '../types'

export const finesseStoneLesser = new Item({
  key: ItemKeys.FINESSE_STONE_LESSER,
  name: 'Lesser Finesse Stone',
  description:
    'Applies bonus to new Hero when summoning:<ul><li>+4 DEX</li><li>+3% to Primary Stat Growth</li><li>+5% to Secondary Stat Growth</li></ul>',
  image: finesseStoneImage,
  type: ItemType.STONE,
  tokenSymbol: 'DFKLFINST',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0xbb5614D466b77d50DdEd994892DFe6F0ACA4eEbb',
    [ChainId.HARMONY_TESTNET]: '0x7F8037ce1973E8DE88640B86bD40B8F79e08E39E'
  },
  craftingIngredients: [
    {
      item: ItemKeys.GOLD_PILE,
      quantity: 2000
    },
    {
      item: ItemKeys.GAIASTEARS,
      quantity: 50
    },
    {
      item: ItemKeys.MAGIC_RESIST_POTION,
      quantity: 1
    },
    {
      item: ItemKeys.STAMINA_POTION,
      quantity: 1
    },
    {
      item: ItemKeys.LANTERNEYE,
      quantity: 1
    },
    {
      item: ItemKeys.SWIFT_THISTLE,
      quantity: 1
    },
    {
      item: ItemKeys.SHVAS_RUNE,
      quantity: 2
    }
  ]
})
