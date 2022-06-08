import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import manaPotionFullImage from '../images/mana-potion-large.png'
import { ItemKeys, ItemType } from '../types'

export const manaPotionFull = new Item({
  key: ItemKeys.MANA_POTION_LARGE,
  name: 'Full Mana Potion',
  description: 'Magical energy courses through a Hero’s body as their Mana Points are fully restored.',
  image: manaPotionFullImage,
  type: ItemType.POTION,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0xDc2C698aF26Ff935cD1c50Eef3a4A933C62AF18D',
    [ChainId.HARMONY_TESTNET]: '0xaf4cB190B6Ec0c63706B2158a0A73071C1599d18'
  },
  tokenSymbol: 'DFKFMNPTN',
  craftingIngredients: [
    {
      item: ItemKeys.LANTERNEYE,
      quantity: 5
    },
    {
      item: ItemKeys.SHIMMERSKIN,
      quantity: 2
    },
    {
      item: ItemKeys.BLUESTEM,
      quantity: 10
    },
    {
      item: ItemKeys.MANA_POTION,
      quantity: 4
    },
    {
      item: ItemKeys.GAIASTEARS,
      quantity: 20
    },
    {
      item: ItemKeys.GOLD_PILE,
      quantity: 3000
    }
  ]
})
