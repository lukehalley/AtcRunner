import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import ironNuggetRawImage from '../images/iron-nugget-raw.png'
import { ItemKeys, ItemType } from '../types'

export const ironIngotRaw = new Item({
  key: ItemKeys.IRON_NUGGET_RAW,
  name: 'Raw Iron Nugget',
  description: 'A truly astounding item.',
  image: ironNuggetRawImage,
  type: ItemType.MATERIAL,
  addresses: {
    [ChainId.HARMONY_MAINNET]: ZERO_ONE_ADDRESS,
    [ChainId.HARMONY_TESTNET]: ZERO_ONE_ADDRESS
  }
})
