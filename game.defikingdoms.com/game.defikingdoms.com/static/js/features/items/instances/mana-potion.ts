import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import manaPotionImage from '../images/mana-potion.png'
import { ItemKeys, ItemType } from '../types'

export const manaPotion = new Item({
  key: ItemKeys.MANA_POTION,
  name: 'Mana Vial',
  description: 'Contains raw magical energy in a tasty liquid form. Restores some Mana to a Hero instantly.',
  image: manaPotionImage,
  type: ItemType.POTION,
  marketPrice: 3000,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x19b020001AB0C12Ffa93e1FDeF90c7C37C8C71ef',
    [ChainId.HARMONY_TESTNET]: '0x7457513C38089CC565fe543268DEe85aB0C738A3'
  },
  tokenSymbol: 'DFKMNPTN',
  craftingIngredients: [
    {
      item: ItemKeys.LANTERNEYE,
      quantity: 8
    },
    {
      item: ItemKeys.BLUESTEM,
      quantity: 4
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
