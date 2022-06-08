import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import swiftnessStoneImage from '../images/swiftness-stone-lesser.gif'
import { ItemKeys, ItemType } from '../types'

export const swiftnessStoneLesser = new Item({
  key: ItemKeys.SWIFTNESS_STONE_LESSER,
  name: 'Lesser Swiftness Stone',
  description:
    'Applies bonus to new Hero when summoning:<ul><li>+4 AGI</li><li>+3% to Primary Stat Growth</li><li>+5% to Secondary Stat Growth</li></ul>',
  image: swiftnessStoneImage,
  type: ItemType.STONE,
  tokenSymbol: 'DFKLSWFTST',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0xd9A8abC0Ce1ADC23F1c1813986c9a9C21C9e7510',
    [ChainId.HARMONY_TESTNET]: '0x9c5CED9F39C196B8d4bB1cB32d76fd18598f77cD'
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
      item: ItemKeys.MANA_POTION,
      quantity: 1
    },
    {
      item: ItemKeys.BLINDNESS_POTION,
      quantity: 1
    },
    {
      item: ItemKeys.SAILFISH,
      quantity: 1
    },
    {
      item: ItemKeys.SWIFT_THISTLE,
      quantity: 2
    },
    {
      item: ItemKeys.SHVAS_RUNE,
      quantity: 2
    }
  ]
})
