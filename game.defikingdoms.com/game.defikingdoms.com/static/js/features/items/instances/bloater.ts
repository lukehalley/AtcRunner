import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import bloaterImage from '../images/bloater.png'
import { ItemKeys, ItemType } from '../types'

export const bloater = new Item({
  key: ItemKeys.BLOATER,
  name: 'Bloater',
  description: 'This plump fish sells for its weight in gold...but it’s mostly hot air.',
  image: bloaterImage,
  type: ItemType.SCRAP,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x78aED65A2Cc40C7D8B0dF1554Da60b38AD351432',
    [ChainId.HARMONY_TESTNET]: '0x87543cC8E5120fe9494B09d4908cAe7dADB7C90a'
  },
  tokenSymbol: 'DFKBLOATER',
  salesPrice: 2.5,
  featuredMetric: true
})
