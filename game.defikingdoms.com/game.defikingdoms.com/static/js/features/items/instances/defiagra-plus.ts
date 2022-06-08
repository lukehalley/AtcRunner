import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import defiagraPlusImage from '../images/defiagra-plus.png'
import { ItemKeys, ItemType } from '../types'

export const defiagraPlus = new Item({
  key: ItemKeys.DEFIAGRA_PLUS,
  name: 'Defiagra Plus',
  description: 'A truly astounding item.',
  image: defiagraPlusImage,
  type: ItemType.POTION,
  addresses: {
    [ChainId.HARMONY_MAINNET]: ZERO_ONE_ADDRESS,
    [ChainId.HARMONY_TESTNET]: ZERO_ONE_ADDRESS
  }
})
