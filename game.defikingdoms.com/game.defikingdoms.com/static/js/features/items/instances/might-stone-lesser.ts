import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import mightStoneImage from '../images/might-stone-lesser.gif'
import { ItemKeys, ItemType } from '../types'

export const mightStoneLesser = new Item({
  key: ItemKeys.MIGHT_STONE_LESSER,
  name: 'Lesser Might Stone',
  description:
    'Applies bonus to new Hero when summoning:<ul><li>+4 STR</li><li>+3% to Primary Stat Growth</li><li>+5% to Secondary Stat Growth</li></ul>',
  image: mightStoneImage,
  type: ItemType.STONE,
  tokenSymbol: 'DFKLMGHTST',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0xe4E7C0c693d8A7FC159776a993495378705464A7',
    [ChainId.HARMONY_TESTNET]: '0x6382781FE94CAadC71027c0457c9CbEff06e204c'
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
      item: ItemKeys.HEALTH_POTION,
      quantity: 1
    },
    {
      item: ItemKeys.TOUGHNESS_POTION,
      quantity: 1
    },
    {
      item: ItemKeys.ROCKROOT,
      quantity: 8
    },
    {
      item: ItemKeys.SPIDER_FRUIT,
      quantity: 3
    },
    {
      item: ItemKeys.SHVAS_RUNE,
      quantity: 2
    }
  ]
})
