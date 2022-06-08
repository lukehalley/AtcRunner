import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import vigorStoneImage from '../images/vigor-stone-lesser.gif'
import { ItemKeys, ItemType } from '../types'

export const vigorStoneLesser = new Item({
  key: ItemKeys.VIGOR_STONE_LESSER,
  name: 'Lesser Vigor Stone',
  description:
    'Applies bonus to new Hero when summoning:<ul><li>+4 VIT</li><li>+3% to Primary Stat Growth</li><li>+5% to Secondary Stat Growth</li></ul>',
  image: vigorStoneImage,
  type: ItemType.STONE,
  tokenSymbol: 'DFKLVGRST',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0xB00CbF5Cd5e7b321436C2D3d8078773522D2F073',
    [ChainId.HARMONY_TESTNET]: '0x0ff7A912CA06607531d25F31B586822aAc997405'
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
      item: ItemKeys.HEALTH_POTION,
      quantity: 1
    },
    {
      item: ItemKeys.STAMINA_POTION,
      quantity: 1
    },
    {
      item: ItemKeys.SAILFISH,
      quantity: 1
    },
    {
      item: ItemKeys.ROCKROOT,
      quantity: 4
    },
    {
      item: ItemKeys.SHVAS_RUNE,
      quantity: 2
    }
  ]
})
