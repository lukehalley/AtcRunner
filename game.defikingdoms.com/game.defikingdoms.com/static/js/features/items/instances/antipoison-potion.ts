import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import antipoisonPotionImage from '../images/antipoison-potion.png'
import { ItemKeys, ItemType } from '../types'

export const antipoisonPotion = new Item({
  key: ItemKeys.ANTIPOISON_POTION,
  name: 'Anti-poison Potion',
  description:
    'The potion courses through the blood, neutralizing toxins and rendering them harmless. Grants immunity to poison while it remains in the body.',
  image: antipoisonPotionImage,
  type: ItemType.POTION,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0xA1f8b0E88c51a45E152934686270DDF4E3356278',
    [ChainId.HARMONY_TESTNET]: '0xaf278b61cdF5B5119b5386f4E91F8D0a1495b864'
  },
  tokenSymbol: 'DFKANTPSN',
  marketPrice: 3000,
  craftingIngredients: [
    {
      item: ItemKeys.IRONSCALE,
      quantity: 2
    },
    {
      item: ItemKeys.AMBERTAFFY,
      quantity: 2
    },
    {
      item: ItemKeys.SPIDER_FRUIT,
      quantity: 3
    },
    {
      item: ItemKeys.GAIASTEARS,
      quantity: 5
    },
    {
      item: ItemKeys.GOLD_PILE,
      quantity: 300
    }
  ]
})
