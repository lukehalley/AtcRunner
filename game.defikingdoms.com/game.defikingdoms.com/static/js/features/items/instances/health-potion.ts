import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import healthPotionImage from '../images/health-potion.png'
import { ItemKeys, ItemType } from '../types'

export const healthPotion = new Item({
  key: ItemKeys.HEALTH_POTION,
  name: 'Health Vial',
  description:
    'First aid for the adventuring Hero. Heals minor wounds and restores some Hit Points to a Hero instantly.',
  image: healthPotionImage,
  type: ItemType.POTION,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x2789F04d22a845dC854145d3c289240517f2BcF0',
    [ChainId.HARMONY_TESTNET]: '0x2314891F7c5EccF899d1Dc6c35A971c23e7E9c31'
  },
  tokenSymbol: 'DFKHLTHPTN',
  marketPrice: 3000,
  craftingIngredients: [
    {
      item: ItemKeys.IRONSCALE,
      quantity: 8
    },
    {
      item: ItemKeys.ROCKROOT,
      quantity: 8
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
