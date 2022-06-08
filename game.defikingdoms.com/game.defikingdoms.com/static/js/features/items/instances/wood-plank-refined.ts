import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import woodPlankRefinedImage from '../images/wood-plank-refined.png'
import { ItemKeys, ItemType } from '../types'

export const woodPlankRefined = new Item({
  key: ItemKeys.WOOD_PLANK_REFINED,
  name: 'Refined Wood Plank',
  description: 'A truly astounding item.',
  image: woodPlankRefinedImage,
  type: ItemType.MATERIAL,
  addresses: {
    [ChainId.HARMONY_MAINNET]: ZERO_ONE_ADDRESS,
    [ChainId.HARMONY_TESTNET]: ZERO_ONE_ADDRESS
  }
})
