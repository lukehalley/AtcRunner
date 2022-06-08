import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import chaosStoneImage from '../images/chaos-stone-lesser.gif'
import { ItemKeys, ItemType } from '../types'

export const chaosStoneLesser = new Item({
  key: ItemKeys.CHAOS_STONE_LESSER,
  name: 'Lesser Chaos Stone',
  description:
    'Applies bonus to new Hero when summoning:<ul><li>+4 bonus to a random stat</li><li>+3% to Primary Stat Growth of that stat</li><li>+5% to Secondary Stat Growth of that stat</li></ul>',
  image: chaosStoneImage,
  type: ItemType.STONE,
  tokenSymbol: 'DFKLCHSST',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x6D4f4bC32df561a35C05866051CbE9C92759Da29',
    [ChainId.HARMONY_TESTNET]: '0x971f32b88Afa7981894a51cE7e19d997A291062a'
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
      item: ItemKeys.MANA_POTION,
      quantity: 1
    },
    {
      item: ItemKeys.SAILFISH,
      quantity: 1
    },
    {
      item: ItemKeys.AMBERTAFFY,
      quantity: 1
    },
    {
      item: ItemKeys.BLUESTEM,
      quantity: 1
    },
    {
      item: ItemKeys.SHVAS_RUNE,
      quantity: 2
    }
  ]
})
