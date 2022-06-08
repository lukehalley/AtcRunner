import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import swiftnessPotionImage from '../images/swiftness-potion.png'
import { ItemKeys, ItemType } from '../types'

export const swiftnessPotion = new Item({
  key: ItemKeys.SWIFTNESS_POTION,
  name: 'Swiftness Potion',
  description:
    'Time itself seems to stretch and slow as reaction time is enhanced. Increases a Hero’s agility temporarily.',
  image: swiftnessPotionImage,
  type: ItemType.POTION,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x872dD1595544CE22ad1e0174449C7ECE6F0bb01b',
    [ChainId.HARMONY_TESTNET]: '0x2724b01CcCE03e9c10B8a8Dfa4e850A22B4e908B'
  },
  tokenSymbol: 'DFKSWFTPTN',
  craftingIngredients: [
    {
      item: ItemKeys.SAILFISH,
      quantity: 2
    },
    {
      item: ItemKeys.SWIFT_THISTLE,
      quantity: 2
    },
    {
      item: ItemKeys.MAGIC_RESIST_POTION,
      quantity: 1
    },
    {
      item: ItemKeys.TOUGHNESS_POTION,
      quantity: 1
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
