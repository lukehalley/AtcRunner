import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import magicResistPotionImage from '../images/magic-resist-potion.png'
import { ItemKeys, ItemType } from '../types'

export const magicResistancePotion = new Item({
  key: ItemKeys.MAGIC_RESIST_POTION,
  name: 'Magic Resistance Potion',
  description:
    'Infuses the body with magically-resistant particles, reducing the effectiveness of magical attacks for a duration.',
  image: magicResistPotionImage,
  type: ItemType.POTION,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x7e120334D9AFFc0982719A4eacC045F78BF41C68',
    [ChainId.HARMONY_TESTNET]: '0x9B589B52Ed702197b4A793B435cc119AAC1c376d'
  },
  tokenSymbol: 'DFKMGCRSPTN',
  craftingIngredients: [
    {
      item: ItemKeys.LANTERNEYE,
      quantity: 8
    },
    {
      item: ItemKeys.MILKWEED,
      quantity: 2
    },
    {
      item: ItemKeys.BLUESTEM,
      quantity: 4
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
