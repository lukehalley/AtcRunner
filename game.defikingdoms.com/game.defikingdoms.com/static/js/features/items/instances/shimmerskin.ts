import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import shimmerskinImage from '../images/shimmerskin.png'
import { ItemKeys, ItemType } from '../types'

export const shimmerskin = new Item({
  key: ItemKeys.SHIMMERSKIN,
  name: 'Shimmerskin',
  description: 'The iridescent beauty of its scales hints at great power.',
  image: shimmerskinImage,
  type: ItemType.SCRAP,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x372CaF681353758f985597A35266f7b330a2A44D',
    [ChainId.HARMONY_TESTNET]: '0xced132D80E18c8553aF415E27e9f79f32f3E4De3'
  },
  tokenSymbol: 'DFKSHIMMERSKIN',
  salesPrice: 60,
  featuredMetric: true
})
