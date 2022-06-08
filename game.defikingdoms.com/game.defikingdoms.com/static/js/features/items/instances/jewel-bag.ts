import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import jewelBagImage from '../images/jewel-bag.png'
import { ItemKeys, ItemType } from '../types'

export const jewelBag = new Item({
  key: ItemKeys.JEWEL_BAG,
  name: 'Jewel',
  description: 'You find yourself subconsciously shaking this bag, just to hear the jingle and jangle.',
  image: jewelBagImage,
  type: ItemType.HIDDEN,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x72Cb10C6bfA5624dD07Ef608027E366bd690048F',
    [ChainId.HARMONY_TESTNET]: '0x63882d0438AdA0dD76ed2E6B7C2D53A55284A557'
  }
})
