import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import bluestemImage from '../images/bluestem.png'
import { ItemKeys, ItemType } from '../types'

export const bluestem = new Item({
  key: ItemKeys.BLUESTEM,
  name: 'Bluestem',
  description: 'Beautiful leaves. Why does blue always remind you of mana?',
  image: bluestemImage,
  type: ItemType.INGREDIENT,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0xAC5c49Ff7E813dE1947DC74bbb1720c353079ac9',
    [ChainId.HARMONY_TESTNET]: '0xF7C247D04A346f86CCE9Afa8919CbE2B365187C1'
  },
  tokenSymbol: 'DFKBLUESTEM',
  salesPrice: 5,
  featuredMetric: true
})
