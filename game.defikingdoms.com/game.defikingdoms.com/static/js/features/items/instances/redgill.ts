import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import redgillImage from '../images/redgill.png'
import { ItemKeys, ItemType } from '../types'

export const redgill = new Item({
  key: ItemKeys.REDGILL,
  name: 'Redgill',
  description: 'Fetches a decent price in gold. A staple in Adelyn fish chowder.',
  image: redgillImage,
  type: ItemType.SCRAP,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0xc5891912718ccFFcC9732D1942cCD98d5934C2e1',
    [ChainId.HARMONY_TESTNET]: '0x59d94005ea7E8E5d44c265Fa64de7A5A34BD6F13'
  },
  tokenSymbol: 'DFKREDGILL',
  salesPrice: 15,
  featuredMetric: true
})
