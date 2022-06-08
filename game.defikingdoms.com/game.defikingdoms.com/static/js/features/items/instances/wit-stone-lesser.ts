import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import witStoneImage from '../images/wit-stone-lesser.gif'
import { ItemKeys, ItemType } from '../types'

export const witStoneLesser = new Item({
  key: ItemKeys.WIT_STONE_LESSER,
  name: 'Lesser Wit Stone',
  description:
    'Applies bonus to new Hero when summoning:<ul><li>+4 INT</li><li>+3% to Primary Stat Growth</li><li>+5% to Secondary Stat Growth</li></ul>',
  image: witStoneImage,
  type: ItemType.STONE,
  tokenSymbol: 'DFKLWITST',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x4Ff7A020ec1100D36d5C81F3D4815F2e9C704b59',
    [ChainId.HARMONY_TESTNET]: '0xc8FF011e1cE1FC3F4450730FCec45c1b4CF5f00f'
  },
  craftingIngredients: [
    {
      item: ItemKeys.GOLD_PILE,
      quantity: 4000
    },
    {
      item: ItemKeys.GAIASTEARS,
      quantity: 50
    },
    {
      item: ItemKeys.ANTIPOISON_POTION,
      quantity: 1
    },
    {
      item: ItemKeys.BLINDNESS_POTION,
      quantity: 1
    },
    {
      item: ItemKeys.SHIMMERSKIN,
      quantity: 2
    },
    {
      item: ItemKeys.DARKWEED,
      quantity: 3
    },
    {
      item: ItemKeys.SHVAS_RUNE,
      quantity: 2
    }
  ]
})
