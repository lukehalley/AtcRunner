import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import rockrootImage from '../images/rockroot.png'
import { ItemKeys, ItemType } from '../types'

export const rockroot = new Item({
  key: ItemKeys.ROCKROOT,
  name: 'Rockroot',
  description: 'Linked to healing. Its ability to grow in such inhospitable conditions is remarkable.',
  image: rockrootImage,
  type: ItemType.INGREDIENT,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x6B10Ad6E3b99090De20bF9f95F960addC35eF3E2',
    [ChainId.HARMONY_TESTNET]: '0x449C417faB9a54e9343Bb48667CB7A495fC7ac25'
  },
  tokenSymbol: 'DFKRCKRT',
  salesPrice: 5,
  featuredMetric: true
})
