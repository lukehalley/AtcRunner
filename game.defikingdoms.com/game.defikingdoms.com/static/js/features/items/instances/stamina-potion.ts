import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import staminaPotionImage from '../images/stamina-potion.png'
import { ItemKeys, ItemType } from '../types'

export const staminaPotion = new Item({
  key: ItemKeys.STAMINA_POTION,
  name: 'Stamina Vial',
  description:
    'A quick pick-me-up in a convenient, single-serving bottle. Energizes a Hero, restoring 25 Stamina instantaneously.',
  image: staminaPotionImage,
  type: ItemType.POTION,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x959ba19508827d1ed2333B1b503Bd5ab006C710e',
    [ChainId.HARMONY_TESTNET]: '0x4b8a24950c91886d49B8156B24fb3DB4f90D7930'
  },
  tokenSymbol: 'DFKSTMNPTN',
  craftingIngredients: [
    {
      item: ItemKeys.SHIMMERSKIN,
      quantity: 1
    },
    {
      item: ItemKeys.SWIFT_THISTLE,
      quantity: 1
    },
    {
      item: ItemKeys.DARKWEED,
      quantity: 2
    },
    {
      item: ItemKeys.SPIDER_FRUIT,
      quantity: 2
    },
    {
      item: ItemKeys.MILKWEED,
      quantity: 2
    },
    {
      item: ItemKeys.GAIASTEARS,
      quantity: 10
    },
    {
      item: ItemKeys.GOLD_PILE,
      quantity: 2000
    }
  ],
  isConsumable: true
})
