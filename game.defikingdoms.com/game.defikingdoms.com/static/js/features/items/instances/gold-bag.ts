import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import goldBagImage from '../images/gold-bag.png'
import { ItemKeys, ItemType } from '../types'

export const goldBag = new Item({
  key: ItemKeys.GOLD_BAG,
  name: 'Gold',
  description: 'You find yourself subconsciously shaking this bag, just to hear the jingle and jangle.',
  image: goldBagImage,
  type: ItemType.HIDDEN,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x3a4EDcf3312f44EF027acfd8c21382a5259936e7',
    [ChainId.HARMONY_TESTNET]: '0x24B46b91E0862221D39dd30FAAd63999717860Ab'
  },
  featuredMetric: true
})
