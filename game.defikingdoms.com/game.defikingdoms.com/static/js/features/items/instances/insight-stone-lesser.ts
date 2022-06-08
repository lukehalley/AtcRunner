import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import insightStoneImage from '../images/insight-stone-lesser.gif'
import { ItemKeys, ItemType } from '../types'

export const insightStoneLesser = new Item({
  key: ItemKeys.INSIGHT_STONE_LESSER,
  name: 'Lesser Insight Stone',
  description:
    'Applies bonus to new Hero when summoning:<ul><li>+4 WIS</li><li>+3% to Primary Stat Growth</li><li>+5% to Secondary Stat Growth</li></ul>',
  image: insightStoneImage,
  type: ItemType.STONE,
  tokenSymbol: 'DFKLINSST',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x762b98B3758d0A5Eb95B3E4A1E2914Ce0A80D99c',
    [ChainId.HARMONY_TESTNET]: '0x2cB6b2Cb1976F2c964C39614c5D549280482fd9f'
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
      quantity: 1
    },
    {
      item: ItemKeys.SPIDER_FRUIT,
      quantity: 5
    },
    {
      item: ItemKeys.SHVAS_RUNE,
      quantity: 2
    }
  ]
})
