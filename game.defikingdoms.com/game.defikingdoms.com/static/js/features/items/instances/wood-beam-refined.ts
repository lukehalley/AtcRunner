import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import woodBeamRefinedImage from '../images/wood-beam-refined.png'
import { ItemKeys, ItemType } from '../types'

export const woodBeamRefined = new Item({
  key: ItemKeys.WOOD_BEAM_REFINED,
  name: 'Refined Wood Beam',
  description: 'A truly astounding item.',
  image: woodBeamRefinedImage,
  type: ItemType.MATERIAL,
  addresses: {
    [ChainId.HARMONY_MAINNET]: ZERO_ONE_ADDRESS,
    [ChainId.HARMONY_TESTNET]: ZERO_ONE_ADDRESS
  }
})
