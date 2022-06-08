import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import redleafImage from '../images/redleaf.png'
import { ItemKeys, ItemType } from '../types'

export const redleaf = new Item({
  key: ItemKeys.REDLEAF,
  name: 'Redleaf',
  description: 'A popular decoration, there’s a reasonable market demand for these.',
  image: redleafImage,
  type: ItemType.SCRAP,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x094243DfABfBB3E6F71814618ace53f07362a84c',
    [ChainId.HARMONY_TESTNET]: '0x219f1576Ff3CaD0Eb12FC9C52E66656Db164b330'
  },
  tokenSymbol: 'DFKRDLF',
  salesPrice: 15,
  featuredMetric: true
})
