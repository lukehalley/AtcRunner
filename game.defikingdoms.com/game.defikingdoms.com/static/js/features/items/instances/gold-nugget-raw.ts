import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import goldNuggetRawImage from '../images/gold-nugget-raw.png'
import { ItemKeys, ItemType } from '../types'

export const goldNuggetRaw = new Item({
  key: ItemKeys.GOLD_NUGGET_RAW,
  name: 'Raw Gold Nugget',
  description: 'A truly astounding item.',
  image: goldNuggetRawImage,
  type: ItemType.MATERIAL,
  addresses: {
    [ChainId.HARMONY_MAINNET]: ZERO_ONE_ADDRESS,
    [ChainId.HARMONY_TESTNET]: ZERO_ONE_ADDRESS
  }
})
