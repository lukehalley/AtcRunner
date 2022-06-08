import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import stoneBlockChiseledImage from '../images/stone-block-chiseled.png'
import { ItemKeys, ItemType } from '../types'

export const stoneBlockChiseled = new Item({
  key: ItemKeys.STONE_BLOCK_CHISELED,
  name: 'Chiseled Stone Block',
  description: 'A truly astounding item.',
  image: stoneBlockChiseledImage,
  type: ItemType.MATERIAL,
  addresses: {
    [ChainId.HARMONY_MAINNET]: ZERO_ONE_ADDRESS,
    [ChainId.HARMONY_TESTNET]: ZERO_ONE_ADDRESS
  }
})
