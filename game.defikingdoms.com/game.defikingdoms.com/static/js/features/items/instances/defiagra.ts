import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import defiagraImage from '../images/defiagra.png'
import { ItemKeys, ItemType } from '../types'

export const defiagra = new Item({
  key: ItemKeys.DEFIAGRA,
  name: 'Defiagra',
  description: 'A truly astounding item.',
  image: defiagraImage,
  type: ItemType.POTION,
  addresses: {
    [ChainId.HARMONY_MAINNET]: ZERO_ONE_ADDRESS,
    [ChainId.HARMONY_TESTNET]: ZERO_ONE_ADDRESS
  }
})
