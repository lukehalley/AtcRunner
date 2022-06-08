import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import toughnessPotionImage from '../images/toughness-potion.png'
import { ItemKeys, ItemType } from '../types'

export const toughnessPotion = new Item({
  key: ItemKeys.TOUGHNESS_POTION,
  name: 'Toughness Potion',
  description:
    'Hardens skin and strengthens bone. Increases a Hero’s defense against physical damage for a period of time.',
  image: toughnessPotionImage,
  type: ItemType.POTION,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0xFb03c364969a0bB572Ce62b8Cd616A7DDEb4c09A',
    [ChainId.HARMONY_TESTNET]: '0xdF0bD83eA9D7ffA04f9515383E24Cd607b0DD932'
  },
  tokenSymbol: 'DFKTFNSPTN',
  craftingIngredients: [
    {
      item: ItemKeys.IRONSCALE,
      quantity: 8
    },
    {
      item: ItemKeys.AMBERTAFFY,
      quantity: 7
    },
    {
      item: ItemKeys.GAIASTEARS,
      quantity: 10
    },
    {
      item: ItemKeys.GOLD_PILE,
      quantity: 500
    }
  ]
})
