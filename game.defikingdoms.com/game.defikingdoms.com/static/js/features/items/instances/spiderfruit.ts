import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import spiderFruitImage from '../images/spider-fruit.png'
import { ItemKeys, ItemType } from '../types'

export const spiderfruit = new Item({
  key: ItemKeys.SPIDER_FRUIT,
  name: 'Spiderfruit',
  description: 'Might look like poison, but it can actually save you from it.',
  image: spiderFruitImage,
  type: ItemType.INGREDIENT,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x19B9F05cdE7A61ab7aae5b0ed91aA62FF51CF881',
    [ChainId.HARMONY_TESTNET]: '0x8808b672760db9fFc87aB26682D8368d31d29e54'
  },
  tokenSymbol: 'DFKSPIDRFRT',
  salesPrice: 10,
  featuredMetric: true
})
