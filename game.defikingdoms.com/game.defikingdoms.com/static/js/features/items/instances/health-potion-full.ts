import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import healthPotionFullImage from '../images/health-potion-large.png'
import { ItemKeys, ItemType } from '../types'

export const healthPotionFull = new Item({
  key: ItemKeys.HEALTH_POTION_LARGE,
  name: 'Full Health Potion',
  description:
    'Wounds magically close while broken bones and torn muscles knit together in seconds. Restores a Hero’s HP fully.',
  image: healthPotionFullImage,
  type: ItemType.POTION,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x87361363A75c9A6303ce813D0B2656c34B68FF52',
    [ChainId.HARMONY_TESTNET]: '0xbD1CF764D09378b387B0f052099978fD7f658B60'
  },
  tokenSymbol: 'DFKFHLTHPTN',
  craftingIngredients: [
    {
      item: ItemKeys.SHIMMERSKIN,
      quantity: 2
    },
    {
      item: ItemKeys.ROCKROOT,
      quantity: 10
    },
    {
      item: ItemKeys.AMBERTAFFY,
      quantity: 3
    },
    {
      item: ItemKeys.HEALTH_POTION,
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
