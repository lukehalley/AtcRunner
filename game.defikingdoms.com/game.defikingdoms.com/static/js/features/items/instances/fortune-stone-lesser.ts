import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import fortuneStoneImage from '../images/fortune-stone-lesser.gif'
import { ItemKeys, ItemType } from '../types'

export const fortuneStoneLesser = new Item({
  key: ItemKeys.FORTUNE_STONE_LESSER,
  name: 'Lesser Fortune Stone',
  description:
    'Applies bonus to new Hero when summoning:<ul><li>+4 LCK</li><li>+3% to Primary Stat Growth</li><li>+5% to Secondary Stat Growth</li></ul>',
  image: fortuneStoneImage,
  type: ItemType.STONE,
  tokenSymbol: 'DFKLFRTUST',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x6D6eA1D2Dc1Df6Eaa2153f212d25Cf92d13Be628',
    [ChainId.HARMONY_TESTNET]: '0x8B460a535f5Ac6D056b2F1CeBC44792eFE80a8CC'
  },
  craftingIngredients: [
    {
      item: ItemKeys.GOLD_PILE,
      quantity: 3600
    },
    {
      item: ItemKeys.GAIASTEARS,
      quantity: 50
    },
    {
      item: ItemKeys.MANA_POTION,
      quantity: 1
    },
    {
      item: ItemKeys.MAGIC_RESIST_POTION,
      quantity: 1
    },
    {
      item: ItemKeys.SAILFISH,
      quantity: 2
    },
    {
      item: ItemKeys.DARKWEED,
      quantity: 4
    },
    {
      item: ItemKeys.SHVAS_RUNE,
      quantity: 2
    }
  ]
})
