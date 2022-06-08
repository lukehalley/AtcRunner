import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import ambertaffyImage from '../images/ambertaffy.png'
import { ItemKeys, ItemType } from '../types'

export const ambertaffy = new Item({
  key: ItemKeys.AMBERTAFFY,
  name: 'Ambertaffy',
  description: 'It bends but it doesn’t break. Doesn’t taste great, though.',
  image: ambertaffyImage,
  type: ItemType.INGREDIENT,
  tokenSymbol: 'DFKAMBRTFY',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x6e1bC01Cc52D165B357c42042cF608159A2B81c1',
    [ChainId.HARMONY_TESTNET]: '0xf644bc484724f964531242992178BC6C5B33C4a3'
  },
  salesPrice: 12.5,
  featuredMetric: true
})
