import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import silverfinImage from '../images/silverfin.png'
import { ItemKeys, ItemType } from '../types'

export const silverfin = new Item({
  key: ItemKeys.SILVERFIN,
  name: 'Silverfin',
  description: 'High market price. Prized for its meat. Pan-sear and flavor with cinnamon.',
  image: silverfinImage,
  type: ItemType.SCRAP,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x2493cfDAcc0f9c07240B5B1C4BE08c62b8eEff69',
    [ChainId.HARMONY_TESTNET]: '0xD6a6fc0279f915BCA59bf9BCf6F8619aa9eda756'
  },
  tokenSymbol: 'DFKSILVERFIN',
  salesPrice: 100,
  featuredMetric: true
})
