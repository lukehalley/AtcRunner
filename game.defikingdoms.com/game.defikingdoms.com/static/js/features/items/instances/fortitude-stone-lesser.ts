import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import fortitudeStoneImage from '../images/fortitude-stone-lesser.gif'
import { ItemKeys, ItemType } from '../types'

export const fortitudeStoneLesser = new Item({
  key: ItemKeys.FORTITUDE_STONE_LESSER,
  name: 'Lesser Fortitude Stone',
  description:
    'Applies bonus to new Hero when summoning:<ul><li>+4 END</li><li>+3% to Primary Stat Growth</li><li>+5% to Secondary Stat Growth</li></ul>',
  image: fortitudeStoneImage,
  type: ItemType.STONE,
  tokenSymbol: 'DFKLFRTIST',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x1f57eb682377f5Ad6276b9315412920BdF9530f6',
    [ChainId.HARMONY_TESTNET]: '0xF71c3fe9388DebDE97798ddA84939c70CFEa516D'
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
      quantity: 6
    },
    {
      item: ItemKeys.BLUESTEM,
      quantity: 6
    },
    {
      item: ItemKeys.SHVAS_RUNE,
      quantity: 2
    }
  ]
})
