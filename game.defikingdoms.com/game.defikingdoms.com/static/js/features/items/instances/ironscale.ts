import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import ironscaleImage from '../images/ironscale.png'
import { ItemKeys, ItemType } from '../types'

export const ironscale = new Item({
  key: ItemKeys.IRONSCALE,
  name: 'Ironscale',
  description: 'The Knight of the Lake. Its scales are as hard as armor.',
  image: ironscaleImage,
  type: ItemType.INGREDIENT,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0xe4Cfee5bF05CeF3418DA74CFB89727D8E4fEE9FA',
    [ChainId.HARMONY_TESTNET]: '0x9578C39Dd4B56407C36aF3718D90a54e8422a706'
  },
  tokenSymbol: 'DFKIRONSCALE',
  salesPrice: 5,
  featuredMetric: true
})
